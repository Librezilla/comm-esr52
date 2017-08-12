/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef nsAbBaseCID_h__
#define nsAbBaseCID_h__

#include "nsISupports.h"
#include "nsIFactory.h"
#include "nsIComponentManager.h"

//
// The start of the contract ID for address book directory factories.
//
#define NS_AB_DIRECTORY_FACTORY_CONTRACTID_PREFIX \
  "@mozilla.org/addressbook/directory-factory;1?name="

//
// The start of the contract ID for address book directory types
//
#define NS_AB_DIRECTORY_TYPE_CONTRACTID_PREFIX \
  "@mozilla.org/addressbook/directory;1?type="

//
// nsAbManager
//
#define NS_ABMANAGER_CONTRACTID \
  "@mozilla.org/abmanager;1"

#define NS_ABMANAGERSTARTUPHANDLER_CONTRACTID \
  "@mozilla.org/commandlinehandler/general-startup;1?type=addressbook"

#define NS_ABMANAGER_CID \
{ /* {ad81b321-8a8a-42ca-a508-fe659de84586} */ \
  0xad81b321, 0x8a8a, 0x42ca, \
  {0xa5, 0x08, 0xfe, 0x65, 0x9d, 0x8e, 0x45, 0x86} \
}

//
// nsAbContentHandler
//
#define NS_ABCONTENTHANDLER_CID \
{ /* {a72ad552-0484-4b5f-8d45-2d79158d22e3} */ \
  0xa72ad552, 0x0484, 0x4b5f, \
	{0x8d, 0x45, 0x2d, 0x79, 0x15, 0x8d, 0x22, 0xe3}	\
}


//
// nsAbBSDirectory - the root address book
//
#define NS_ABDIRECTORY_CONTRACTID \
  NS_AB_DIRECTORY_TYPE_CONTRACTID_PREFIX "moz-abdirectory"

#define NS_ABDIRECTORY_CID \
{ /* {012D3C24-1DD2-11B2-BA79-B4AD359FC461}*/ \
    0x012D3C24, 0x1DD2, 0x11B2, \
    {0xBA, 0x79, 0xB4, 0xAD, 0x35, 0x9F, 0xC4, 0x61} \
}


//
// nsAddressBookDB
//
#define NS_ADDRDATABASE_CONTRACTID \
  "@mozilla.org/addressbook/carddatabase;1"

#define NS_ADDRDATABASE_CID						\
{ /* 63187917-1D19-11d3-A302-001083003D0C */		\
    0x63187917, 0x1d19, 0x11d3,						\
    {0xa3, 0x2, 0x0, 0x10, 0x83, 0x0, 0x3d, 0xc}	\
}

//
// nsAbCardProperty
//
#define NS_ABCARDPROPERTY_CONTRACTID \
  "@mozilla.org/addressbook/cardproperty;1"
#define NS_ABCARDPROPERTY_CID						\
{ /* 2B722171-2CEA-11d3-9E0B-00A0C92B5F0D */		\
    0x2b722171, 0x2cea, 0x11d3,						\
    {0x9e, 0xb, 0x0, 0xa0, 0xc9, 0x2b, 0x5f, 0xd}	\
}

//
// nsAbDirProperty
//
#define NS_ABDIRPROPERTY_CONTRACTID \
  "@mozilla.org/addressbook/directoryproperty;1"
#define NS_ABDIRPROPERTY_CID						\
{ /* 6FD8EC67-3965-11d3-A316-001083003D0C */		\
    0x6fd8ec67, 0x3965, 0x11d3,						\
    {0xa3, 0x16, 0x0, 0x10, 0x83, 0x0, 0x3d, 0xc}	\
}

//
// nsAbDirectoryProperties
//
#define NS_ABDIRECTORYPROPERTIES_CONTRACTID \
  "@mozilla.org/addressbook/properties;1"
#define NS_ABDIRECTORYPROPERTIES_CID						\
{ /* 8b00a972-1dd2-11b2-9d9c-9c377a9c3dba */		\
    0x8b00a972, 0x1dd2, 0x11b2, \
    {0x9d, 0x9c, 0x9c, 0x37, 0x7a, 0x9c, 0x3d, 0xba} \
}

//
// nsAbAddressCollector
//
#define NS_ABADDRESSCOLLECTOR_CONTRACTID \
  "@mozilla.org/addressbook/services/addressCollector;1"
#define NS_ABADDRESSCOLLECTOR_CID \
{	/* e7702d5a-99d8-4648-bab7-919ea29f30b6 */ \
	0xe7702d5a, 0x99d8, 0x4648,	\
	{0xba, 0xb7, 0x91, 0x9e, 0xa2, 0x9f, 0x30, 0xb6}	\
}

//
// addbook URL
//
#define NS_ADDBOOKURL_CONTRACTID \
  "@mozilla.org/addressbook/services/url;1?type=addbook"

#define NS_ADDBOOKURL_CID \
{	/* ff04c8e6-501e-11d3-a527-0060b0fc0444 */		\
	0xff04c8e6, 0x501e, 0x11d3,						\
	{0xa5, 0x27, 0x0, 0x60, 0xb0, 0xfc, 0x4, 0x44}	\
}

//
// addbook Protocol Handler
//
#define NS_ADDBOOK_HANDLER_CONTRACTID \
  "@mozilla.org/addressbook/services/addbook;1"
#define NS_ADDBOOK_HANDLER_CID \
{	/* ff04c8e6-501e-11d3-ffcc-0060b0fc0444 */		\
	0xff04c8e6, 0x501e, 0x11d3,						\
	{0xff, 0xcc, 0x0, 0x60, 0xb0, 0xfc, 0x4, 0x44}	\
}

//
// directory factory service
//
#define NS_ABDIRFACTORYSERVICE_CONTRACTID \
  "@mozilla.org/addressbook/directory-factory-service;1"

#define NS_ABDIRFACTORYSERVICE_CID				\
{ /* {F8B212F2-742B-4A48-B7A0-4C44D4DDB121}*/			\
	0xF8B212F2, 0x742B, 0x4A48,				\
	{0xB7, 0xA0, 0x4C, 0x44, 0xD4, 0xDD, 0xB1, 0x21}	\
}

//
// mdb directory factory
//
#define NS_ABMDBDIRECTORY "moz-abmdbdirectory"

#define NS_ABMDBDIRFACTORY_CONTRACTID \
  NS_AB_DIRECTORY_FACTORY_CONTRACTID_PREFIX NS_ABMDBDIRECTORY

#define NS_ABMDBDIRFACTORY_CID				\
{ /* {E1CB9C8A-722D-43E4-9D7B-7CCAE4B0338A}*/			\
	0xE1CB9C8A, 0x722D, 0x43E4,				\
	{0x9D, 0x7B, 0x7C, 0xCA, 0xE4, 0xB0, 0x33, 0x8A}	\
}

//
// nsAbMDBDirectory
//
#define NS_ABMDBDIRECTORY_CONTRACTID \
  NS_AB_DIRECTORY_TYPE_CONTRACTID_PREFIX NS_ABMDBDIRECTORY

#define NS_ABMDBDIRECTORY_CID \
{ /* {e618f894-1dd1-11b2-889c-9aaefaa90dde}*/ \
  0xe618f894, 0x1dd1, 0x11b2, \
  {0x88, 0x9c, 0x9a, 0xae, 0xfa, 0xa9, 0x0d, 0xde} \
}

//
// nsAbMDBCard
//
#define NS_ABMDBCARD_CONTRACTID \
  "@mozilla.org/addressbook/moz-abmdbcard;1"

#define NS_ABMDBCARD_CID				\
{ /* {f578a5d2-1dd1-11b2-8841-f45cc5e765f8} */		\
    0xf578a5d2, 0x1dd1, 0x11b2,				\
    {0x88, 0x41, 0xf4, 0x5c, 0xc5, 0xe7, 0x65, 0xf8}	\
}

//
//  Addressbook Query support
//

#define NS_ABDIRECTORYQUERYARGUMENTS_CONTRACTID \
  "@mozilla.org/addressbook/directory/query-arguments;1"

#define NS_ABDIRECTORYQUERYARGUMENTS_CID                          \
{ /* {f7dc2aeb-8e62-4750-965c-24b9e09ed8d2} */        \
  0xf7dc2aeb, 0x8e62, 0x4750,                     \
  { 0x96, 0x5c, 0x24, 0xb9, 0xe0, 0x9e, 0xd8, 0xd2 }  \
}


#define NS_BOOLEANCONDITIONSTRING_CONTRACTID \
  "@mozilla.org/boolean-expression/condition-string;1"

#define NS_BOOLEANCONDITIONSTRING_CID                         \
{ /* {ca1944a9-527e-4c77-895d-d0466dd41cf5} */        \
  0xca1944a9, 0x527e, 0x4c77, \
    { 0x89, 0x5d, 0xd0, 0x46, 0x6d, 0xd4, 0x1c, 0xf5 } \
}


#define NS_BOOLEANEXPRESSION_CONTRACTID \
  "@mozilla.org/boolean-expression/n-peer;1"

#define NS_BOOLEANEXPRESSION_CID                         \
{ /* {2c2e75c8-6f56-4a50-af1c-72af5d0e8d41} */        \
  0x2c2e75c8, 0x6f56, 0x4a50, \
    { 0xaf, 0x1c, 0x72, 0xaf, 0x5d, 0x0e, 0x8d, 0x41 } \
}

#define NS_ABDIRECTORYQUERYPROXY_CONTRACTID                     \
        "@mozilla.org/addressbook/directory-query/proxy;1"      

#define NS_ABDIRECTORYQUERYPROXY_CID                            \
{ /* {E162E335-541B-43B4-AAEA-FE591E240CAF}*/                   \
        0xE162E335, 0x541B, 0x43B4,                             \
        {0xAA, 0xEA, 0xFE, 0x59, 0x1E, 0x24, 0x0C, 0xAF}        \
}

// nsABView

#define NS_ABVIEW_CID \
{ 0xc5eb5d6a, 0x1dd1, 0x11b2, \
 { 0xa0, 0x25, 0x94, 0xd1, 0x18, 0x1f, 0xc5, 0x9c }}

#define NS_ABVIEW_CONTRACTID \
 "@mozilla.org/addressbook/abview;1"

#define NS_MSGVCARDSERVICE_CID \
{ 0x3c4ac0da, 0x2cda, 0x4018, \
 { 0x95, 0x51, 0xe1, 0x58, 0xb2, 0xe1, 0x22, 0xd3 }}

#define NS_MSGVCARDSERVICE_CONTRACTID \
 "@mozilla.org/addressbook/msgvcardservice;1"

#endif // nsAbBaseCID_h__
