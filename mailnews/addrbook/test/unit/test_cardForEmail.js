/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/*
 * Tests nsIAbDirectory::cardForEmailAddress
 * - checks correct return when no email address supplied
 * - checks correct return when no matching email address supplied
 * - checks correct return when matching email address supplied.
 *
 * Uses: cardForEmail.mab
 */

function check_correct_card(card) {
  do_check_neq(card, null);

  do_check_eq(card.firstName, "FirstName1");
  do_check_eq(card.lastName, "LastName1");
  do_check_eq(card.displayName, "DisplayName1");
  do_check_eq(card.primaryEmail, "PrimaryEmail1@test.invalid");
}

function run_test() {
  // Test setup - copy the data file into place
  var testAB = do_get_file("../mailnews/addrbook/test/unit/data/cardForEmail.mab");

  // Copy the file to the profile directory for a PAB
  testAB.copyTo(gProfileDir, kPABData.fileName);

  // Test - Get the directory
  var abManager = Components.classes["@mozilla.org/abmanager;1"]
                            .getService(Components.interfaces.nsIAbManager);

  var AB = abManager.getDirectory(kPABData.URI);

  // Test - Check that a null string succeeds and does not
  // return a card (bug 404264)
  do_check_true(AB.cardForEmailAddress(null) == null);

  // Test - Check that an empty string succeeds and does not
  // return a card (bug 404264)
  do_check_true(AB.cardForEmailAddress("") == null);

  // Test - Check that we don't match an email that doesn't exist
  do_check_true(AB.cardForEmailAddress("nocard@this.email.invalid") == null);

  // Test - Check that we match this email and some of the fields
  // of the card are correct.
  var card = AB.cardForEmailAddress("PrimaryEmail1@test.invalid");

  check_correct_card(card);

  // Check getCardFromProperty returns null correctly for non-extant properties
  do_check_eq(AB.getCardFromProperty("JobTitle", "", false), null);
  do_check_eq(AB.getCardFromProperty("JobTitle", "JobTitle", false), null);

  // Check case-insensitive searching works
  card = AB.getCardFromProperty("JobTitle", "JobTitle1", true);
  check_correct_card(card);
  card = AB.getCardFromProperty("JobTitle", "JobTitle1", false);
  check_correct_card(card);

  do_check_eq(AB.getCardFromProperty("JobTitle", "jobtitle1", true), null);

  card = AB.getCardFromProperty("JobTitle", "jobtitle1", false);
  check_correct_card(card);
};
