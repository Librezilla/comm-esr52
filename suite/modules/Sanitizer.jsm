/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var EXPORTED_SYMBOLS = ["Sanitizer"];

var Sanitizer = {
  get _prefs() {
    delete this._prefs;
    return this._prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                   .getService(Components.interfaces.nsIPrefService)
                                   .getBranch("privacy.sanitize.");
  },

  /**
   * Deletes privacy sensitive data in a batch, optionally showing the
   * sanitize UI, according to user preferences
   *
   * @returns  null if everything's fine
   *           an object in the form { itemName: error, ... } on (partial) failure
   */
  sanitize: function(aParentWindow) {
    this.readSettings(aParentWindow);
    return this.doPendingSanitize();
  },

  clearSettings: function() {
    for (var itemName in this.items)
      this.items[itemName].willClear = false;
  },

  readSettings: function(aParentWindow) {
    var itemPrefs = Components.classes["@mozilla.org/preferences-service;1"]
                              .getService(Components.interfaces.nsIPrefService)
                              .getBranch("privacy.item.");
    for (var itemName in this.items) {
      var item = this.items[itemName];
      if ("clear" in item)
        item.willClear = itemPrefs.getBoolPref(itemName);
    }
    if (this._prefs.getBoolPref("promptOnSanitize")) {
      var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                         .getService(Components.interfaces.nsIWindowWatcher);
      // make this an app-modal window on Mac.
      var win = "nsILocalFileMac" in Components.interfaces ? null
                                                           : aParentWindow;
      ww.openWindow(win,
                    "chrome://communicator/content/sanitize.xul", "Sanitize",
                    "chrome,titlebar,centerscreen,dialog,modal", null);
    }
  },

  doPendingSanitize: function() {
    // do the actual sanitizing
    var errors = null;
    for (var itemName in this.items) {
      var item = this.items[itemName];
      if ("clear" in item && item.willClear && item.canClear) {
        // Some of these clear() may raise exceptions (see bug #265028)
        // to sanitize as much as possible, we catch and store them,
        // rather than fail fast.
        // Callers should check returned errors and give user feedback
        // about items that could not be sanitized
        try {
          item.clear();
        } catch(ex) {
          if (!errors)
            errors = {};
          errors[itemName] = ex;
          dump("Error sanitizing " + itemName + ": " + ex + "\n");
        }
      }
    }
    return errors;
  },

  // warning to the caller: this one may raise an exception (e.g. bug #265028)
  clearItem: function(aItemName) {
    if (this.items[aItemName].canClear)
      this.items[aItemName].clear();
  },

  setClearItem: function(aItemName, aWillClear) {
    this.items[aItemName].willClear = aWillClear;
  },

  willClearItem: function(aItemName) this.items[aItemName].willClear,

  canClearItem: function(aItemName) this.items[aItemName].canClear,

  // this is called on startup and shutdown, to perform pending sanitizations
  checkSettings: function() {
    if (this._prefs.getBoolPref("sanitizeOnShutdown") &&
        !this._prefs.prefHasUserValue("didShutdownSanitize"))
      this.readSettings();
    else
      this.clearSettings();
  },

  // clear plugin data
  _clearPluginData: function(aFlagName) {
    const nsIPluginHost = Components.interfaces.nsIPluginHost;
    var ph = Components.classes["@mozilla.org/plugin/host;1"]
                       .getService(nsIPluginHost);

    if (!(aFlagName in nsIPluginHost))
      return;

    var flag = nsIPluginHost[aFlagName];
    var tags = ph.getPluginTags();
    for (var i = 0; i < tags.length; i++) {
      try {
        ph.clearSiteData(tags[i], null, flag, -1);
      } catch (ex) {
        // Ignore errors from the plugin
      }
    }
  },

  items: {
    cache: {
      clear: function() {
        // use try/catch for everything but the last task so we clear as much as possible
        var cacheService = Components.classes["@mozilla.org/network/cache-service;1"]
                                     .getService(Components.interfaces.nsICacheService);
        try {
          cacheService.evictEntries(Components.interfaces.nsICache.STORE_ANYWHERE);
        } catch(ex) {}

        Components.classes["@mozilla.org/image/tools;1"]
                  .getService(Components.interfaces.imgITools)
                  .getImgCacheForDocument(null)
                  .clearCache(false); // true=chrome, false=content
      },

      canClear: true
    },

    offlineApps: {
      clear: function() {
        // use try/catch for everything but the last task so we clear as much as possible
        try {
          var cacheService = Components.classes["@mozilla.org/network/cache-service;1"]
                                       .getService(Components.interfaces.nsICacheService);
          cacheService.evictEntries(Components.interfaces.nsICache.STORE_OFFLINE);
        } catch(ex) {}
      },

      canClear: true
    },

    cookies: {
      clear: function() {
        var cookieMgr = Components.classes["@mozilla.org/cookiemanager;1"]
                                  .getService(Components.interfaces.nsICookieManager);
        cookieMgr.removeAll();

        Sanitizer._clearPluginData("FLAG_CLEAR_ALL");

        // clear any network geolocation provider sessions
        var psvc = Components.classes["@mozilla.org/preferences-service;1"]
                             .getService(Components.interfaces.nsIPrefService);
        try {
          var branch = psvc.getBranch("geo.wifi.access_token.");
          branch.deleteBranch("");
        } catch (e) {}
      },

      canClear: true
    },

    history: {
      clear: function() {
        // use try/catch for everything but the last task so we clear as much as possible
        try {
          var globalHistory = Components.classes["@mozilla.org/browser/global-history;2"]
                                        .getService(Components.interfaces.nsIBrowserHistory);
          globalHistory.removeAllPages();
        } catch(ex) {}

        try {
          var os = Components.classes["@mozilla.org/observer-service;1"]
                             .getService(Components.interfaces.nsIObserverService);
          os.notifyObservers(null, "browser:purge-session-history", "");
        } catch(ex) {}
      },

        // bug 347231: Always allow clearing history due to dependencies on
        // the browser:purge-session-history notification. (like error console)
      canClear: true
    },

    urlbar: {
      clear: function() {
        // Clear last URL of the Open Web Location dialog
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                              .getService(Components.interfaces.nsIPrefBranch);
        try {
          prefs.clearUserPref("general.open_location.last_url");
        } catch(ex) {}

        // Clear URLbar history (see also pref-history.js)
        var file = Components.classes["@mozilla.org/file/directory_service;1"]
                             .getService(Components.interfaces.nsIProperties)
                             .get("ProfD", Components.interfaces.nsIFile);
        file.append("urlbarhistory.sqlite");
        if (file.exists())
          file.remove(false);
      },

      get canClear() {
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                              .getService(Components.interfaces.nsIPrefBranch);
        if (!prefs.prefIsLocked("general.open_location.last_url") &&
            prefs.prefHasUserValue("general.open_location.last_url"))
          return true;

        var file = Components.classes["@mozilla.org/file/directory_service;1"]
                             .getService(Components.interfaces.nsIProperties)
                             .get("ProfD", Components.interfaces.nsIFile);
        file.append("urlbarhistory.sqlite");
        return file.exists();
      }
    },

    formdata: {
      clear: function() {
        var formHistory = Components.classes["@mozilla.org/satchel/form-history;1"]
                                    .getService(Components.interfaces.nsIFormHistory2);
        formHistory.removeAllEntries();
      },

      get canClear() {
        var formHistory = Components.classes["@mozilla.org/satchel/form-history;1"]
                                    .getService(Components.interfaces.nsIFormHistory2);
        return formHistory.hasEntries;
      }
    },

    downloads: {
      clear: function() {
        var dlMgr = Components.classes["@mozilla.org/download-manager;1"]
                              .getService(Components.interfaces.nsIDownloadManager);
        dlMgr.cleanUp();
      },

      get canClear() {
        var dlMgr = Components.classes["@mozilla.org/download-manager;1"]
                              .getService(Components.interfaces.nsIDownloadManager);
        return dlMgr.canCleanUp;
      }
    },

    passwords: {
      clear: function() {
        var pwmgr = Components.classes["@mozilla.org/login-manager;1"]
                              .getService(Components.interfaces.nsILoginManager);
        pwmgr.removeAllLogins();
      },

      get canClear() {
        var pwmgr = Components.classes["@mozilla.org/login-manager;1"]
                              .getService(Components.interfaces.nsILoginManager);
        var count = pwmgr.countLogins("", "", ""); // count all logins
        return (count > 0);
      }
    },

    sessions: {
      clear: function() {
        // clear all auth tokens
        Components.classes["@mozilla.org/security/pk11tokendb;1"]
                  .createInstance(Components.interfaces.nsIPK11TokenDB)
                  .getInternalKeyToken()
                  .checkPassword("");

        // clear plain HTTP auth sessions
        var authMgr = Components.classes["@mozilla.org/network/http-auth-manager;1"]
                                .getService(Components.interfaces.nsIHttpAuthManager);
        authMgr.clearAll();
      },

      canClear: true
    }
  }
};
