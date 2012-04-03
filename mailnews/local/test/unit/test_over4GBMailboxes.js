/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/*
 * Test to ensure that copyFileMessageInLocalFolder checks for over 4 GiB local folder, and that
 * we can parse and compact folders over 4 GiB to allow users to get them under
 * 4 GiB.
 */

load("../../../resources/mailTestUtils.js");
load("../../../resources/asyncTestUtils.js");
load("../../../resources/alertTestUtils.js");
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
load("../../../resources/messageGenerator.js");

Services.prefs.setCharPref("mail.serverDefaultStoreContractID",
                           "@mozilla.org/msgstore/berkeleystore;1");

// If we're running out of memory parsing the folder, lowering the
// block size might help, though it will slow the test down and consume
// more disk space.
const kSparseBlockSize = 102400000;

var gGotAlert = false;
var gLocalInboxSize;

var dummyDocShell =
{
  getInterface: function (iid) {
    if (iid.equals(Ci.nsIAuthPrompt)) {
      return Cc["@mozilla.org/login-manager/prompter;1"]
               .getService(Ci.nsIAuthPrompt);
    }

    throw Components.results.NS_ERROR_FAILURE;
  },

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIDocShell,
                                         Ci.nsIInterfaceRequestor])
}

// This alert() is triggered when file size becomes close (enough) to or
// exceeds 4 GiB.
// See hardcoded value in nsMsgBrkMBoxStore::HasSpaceAvailable().
function alert(aDialogTitle, aText) {
  // See "/*/locales/en-US/chrome/*/messenger.properties > mailboxTooLarge".
  do_check_eq(aText.indexOf("The folder Inbox is full, and can't hold any more messages."), 0);
  gGotAlert = true;
}

// Dummy message window so we can do the move as an offline operation.
var dummyMsgWindow =
{
  rootDocShell: dummyDocShell,
  promptDialog: alertUtilsPrompts,

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIMsgWindow,
                                         Ci.nsISupportsWeakReference])
};

function run_test()
{
  loadLocalMailAccount();

  // "Master" do_test_pending(), paired with a do_test_finished() at the end of
  // all the operations.
  do_test_pending();

  // On Windows, check whether the drive is NTFS. If it is, mark the file as
  // sparse. If it isn't, then bail out now, because in all probability it is
  // FAT32, which doesn't support file sizes greater than 4 GB.
  if ("@mozilla.org/windows-registry-key;1" in Cc &&
      get_file_system(gLocalInboxFolder.filePath) != "NTFS")
  {
    dump("On Windows, this test only works on NTFS volumes.\n");

    endTest();
    return;
  }
  if (gLocalInboxFolder.filePath.clone().diskSpaceAvailable < 0x110000000)
  {
    dump("this test needs >4 GB of free disk space.\n");

    endTest();
    return;
  }

  // put a single message in the Inbox.
  let messageGenerator = new MessageGenerator();
  let message = messageGenerator.makeMessage();
  let localInbox = gLocalInboxFolder.QueryInterface(Ci.nsIMsgLocalMailFolder);
  localInbox.addMessage(message.toMboxString());

  // Grow local inbox to over 4 GiB.
  let plugStore = gLocalInboxFolder.msgStore;
  do {
    let inboxFile = gLocalInboxFolder.filePath.clone();
    let nextOffset = inboxFile.fileSize + kSparseBlockSize;
    // "Add" a new (empty) sparse block at the end of the file.
    mark_file_region_sparse(inboxFile, inboxFile.fileSize,
                            kSparseBlockSize);
    let reusable = new Object;
    let newMsgHdr = new Object;
    let outputStream = plugStore.getNewMsgOutputStream(gLocalInboxFolder,
                                                       newMsgHdr, reusable)
                                .QueryInterface(Ci.nsISeekableStream);
    outputStream.seek(0, nextOffset);
    // Add a CR+LF at end of previous message then
    // write the (same) message another time.
    let mboxString = "\r\n" + message.toMboxString();
    outputStream.write(mboxString, mboxString.length);
    outputStream.close();
    plugStore.finishNewMessage(outputStream, newMsgHdr);
  }
  while (gLocalInboxFolder.filePath.fileSize < 0x100000000)

  // Save initial file size.
  gLocalInboxSize = gLocalInboxFolder.filePath.fileSize;

  // Use copyFileMessageInLocalFolder() to (try to) append another message
  //  to local inbox.
  let file = do_get_file("../../../data/multipart-complex2");
  try {
    copyFileMessageInLocalFolder(file, 0, "", dummyMsgWindow,
                                 function(aMessageHeadersKeys, aStatus) {
      do_check_false(Components.isSuccessCode(aStatus));
    });
  } catch (ex) {
  }

  // Force the db closed, so that getDatabaseWithReparse will notice
  // that it's out of date.
  gLocalInboxFolder.msgDatabase.ForceClosed();
  gLocalInboxFolder.msgDatabase = null;
  try {
    gLocalInboxFolder.getDatabaseWithReparse(ParseListener, dummyMsgWindow);
  } catch (ex) {
    do_check_true(ex.result == Cr.NS_ERROR_NOT_INITIALIZED);
  }
}

function testCompact()
{
  // mark messages as deleted.
  let msgDB = gLocalInboxFolder.msgDatabase;
  let enumerator = msgDB.EnumerateMessages();
  let firstHdr = true;
  let messages = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
  while (enumerator.hasMoreElements()) {
    let header = enumerator.getNext();
    if (header instanceof Components.interfaces.nsIMsgDBHdr && !firstHdr)
      messages.appendElement(header, false);
    firstHdr = false;
  }
  gLocalInboxFolder.deleteMessages(messages, null, true, false, null, false);

  // Note: compact() will also add 'X-Mozilla-Status' and 'X-Mozilla-Status2'
  // lines to message(s).
  gLocalInboxFolder.compact(CompactListener, null);
}

var ParseListener =
{
  OnStartRunningUrl: function (aUrl) {},
  OnStopRunningUrl: function (aUrl, aExitCode) {
    // Check: reparse successful
    do_check_eq(aExitCode, 0);
    do_check_true(gLocalInboxFolder.msgDatabase.summaryValid);
    testCompact();
  }
};

var CompactListener =
{
  OnStartRunningUrl: function (aUrl) {},
  OnStopRunningUrl: function (aUrl, aExitCode) {
    // Check: message successfully copied.
    do_check_eq(aExitCode, 0);
    do_check_true(gLocalInboxFolder.msgDatabase.summaryValid);
    // check that folder size isn't much bigger than our sparse block size,
    // i.e., that we just have one message.
    do_check_true(gLocalInboxFolder.filePath.fileSize < kSparseBlockSize + 1000);
    do_check_eq(gLocalInboxFolder.getTotalMessages(false), 1);

    do_check_true(gGotAlert);
    endTest();
  }
};

function endTest()
{
  // free up disk space - if you want to look at the file after running
  // this test, comment out this line.
  gLocalInboxFolder.filePath.remove(false);

  do_test_finished();
}
