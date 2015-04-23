/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 *  Test appropriate visibility of infoBoxExpanderWrapper and
 *  additionalInfoFields in infoBox section of library
 */

const TEST_URI = "http://www.mozilla.org/";

var gTests = [];
var gLibrary;

//------------------------------------------------------------------------------

gTests.push({
  desc: "Bug 430148 - Remove or hide the more/less button in details pane...",
  run: function() {
    var PO = gLibrary.PlacesOrganizer;
    var infoBoxExpanderWrapper = getAndCheckElmtById("infoBoxExpanderWrapper");

    function addVisitsCallback() {
      // open all bookmarks node
      PO.selectLeftPaneQuery("AllBookmarks");
      isnot(PO._places.selectedNode, null,
            "Correctly selected all bookmarks node.");
      checkInfoBoxSelected(PO);
      ok(infoBoxExpanderWrapper.hidden,
         "Expander button is hidden for all bookmarks node.");
      checkAddInfoFieldsCollapsed(PO);

      // open bookmarks menu node
      PO.selectLeftPaneQuery("BookmarksMenu");
      isnot(PO._places.selectedNode, null,
            "Correctly selected bookmarks menu node.");
      checkInfoBoxSelected(PO);
      ok(infoBoxExpanderWrapper.hidden,
         "Expander button is hidden for bookmarks menu node.");
      checkAddInfoFieldsCollapsed(PO);

      // open recently bookmarked node
      var menuNode = PO._places.selectedNode.
                     QueryInterface(Ci.nsINavHistoryContainerResultNode);
      menuNode.containerOpen = true;
      var childNode = menuNode.getChild(0);
      isnot(childNode, null, "Bookmarks menu child node exists.");
      var recentlyBookmarkedTitle = PlacesUIUtils.
                                    getString("recentlyBookmarkedTitle");
      isnot(recentlyBookmarkedTitle, null,
            "Correctly got the recently bookmarked title locale string.");
      is(childNode.title, recentlyBookmarkedTitle,
         "Correctly selected recently bookmarked node.");
      PO._places.selectNode(childNode);
      checkInfoBoxSelected(PO);
      // Note: SeaMonkey differs from Firefox UI in this case.
      ok(infoBoxExpanderWrapper.hidden,
         "Expander button is hidden for recently bookmarked node.");
      checkAddInfoFieldsNotCollapsed(PO);

      // open first bookmark
      PO._content.focus();
      var view = PO._content.treeBoxObject.view;
      ok(view.rowCount > 0, "Bookmark item exists.");
      view.selection.select(0);
      checkInfoBoxSelected(PO);
      ok(!infoBoxExpanderWrapper.hidden,
         "Expander button is not hidden for bookmark item.");
      checkAddInfoFieldsNotCollapsed(PO);
      checkAddInfoFields(PO, "bookmark item");

      // make sure additional fields are still hidden in second bookmark item
      ok(view.rowCount > 1, "Second bookmark item exists.");
      view.selection.select(1);
      checkInfoBoxSelected(PO);
      ok(!infoBoxExpanderWrapper.hidden,
         "Expander button is not hidden for second bookmark item.");
      checkAddInfoFieldsNotCollapsed(PO);
      checkAddInfoFields(PO, "second bookmark item");

      menuNode.containerOpen = false;

      waitForClearHistory(nextTest);
    };

    // Add a visit to browser history
    addVisits(
      { uri: PlacesUtils._uri(TEST_URI),
        visitDate: Date.now()*1000,
        transition: PlacesUtils.history.TRANSITION_TYPED },
      addVisitsCallback);
  } 
});

function checkInfoBoxSelected(PO) {
  is(getAndCheckElmtById("detailsDeck").selectedIndex, 1,
     "Selected element in detailsDeck is infoBox.");
}

function checkAddInfoFieldsCollapsed(PO) {
  PO._additionalInfoFields.forEach(function (id) {
    ok(getAndCheckElmtById(id).collapsed,
       "Additional info field correctly collapsed: #" + id);
  });
}

function checkAddInfoFieldsNotCollapsed(PO) {
  ok(PO._additionalInfoFields.some(function (id) {
      return !getAndCheckElmtById(id).collapsed;
     }), "Some additional info field correctly not collapsed");
}

function checkAddInfoFields(PO, nodeName) {
  ok(true, "Checking additional info fields visibiity for node: " + nodeName);
  var expanderButton = getAndCheckElmtById("infoBoxExpander");

  // make sure additional fields are hidden by default
  PO._additionalInfoFields.forEach(function (id) {
    ok(getAndCheckElmtById(id).hidden,
       "Additional info field correctly hidden by default: #" + id);
  });

  // toggle fields and make sure they are hidden/unhidden as expected
  expanderButton.click();
  PO._additionalInfoFields.forEach(function (id) {
    ok(!getAndCheckElmtById(id).hidden,
       "Additional info field correctly unhidden after toggle: #" + id);
  });
  expanderButton.click();
  PO._additionalInfoFields.forEach(function (id) {
    ok(getAndCheckElmtById(id).hidden,
       "Additional info field correctly hidden after toggle: #" + id);
  });
}

function getAndCheckElmtById(id) {
  var elmt = gLibrary.document.getElementById(id);
  isnot(elmt, null, "Correctly got element: #" + id);
  return elmt;
}

//------------------------------------------------------------------------------

function nextTest() {
  if (gTests.length) {
    var test = gTests.shift();
    ok(true, "TEST: " + test.desc);
    dump("TEST: " + test.desc + "\n");
    test.run();
  }
  else {
    // Close Library window.
    gLibrary.close();
    // No need to cleanup anything, we have a correct left pane now.
    finish();
  }
}

function test() {
  waitForExplicitFinish();
  // Sanity checks.
  ok(PlacesUtils, "PlacesUtils is running in chrome context");
  ok(PlacesUIUtils, "PlacesUIUtils is running in chrome context");

  // Open Library.
  openLibrary(function (library) {
    gLibrary = library;
    gLibrary.PlacesOrganizer._places.focus();
    nextTest(gLibrary);
  });
}
