/*
* @flow
*/
import electron from 'electron';
import MenuBuilder from './menu.js';

import watchman from 'fb-watchman';
var client = new watchman.Client();

import Store from './store.js';

const app = electron.app;
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

const store = new Store({
  configName: 'electra_store'
});

const storeData = store.parseDataFile('./electra_store.json');
const monitors = storeData.monitors;

client.capabilityCheck({optional:[], required:[]},
//client.capabilityCheck({optional:[], required:['relative_root']},
  function (error, resp) {
    if (error) {
      console.log(error);
      client.end();
      return;
    }

    monitors.forEach( (m) => {
      //console.log("\x1b[36m%s\x1b[0m", m.subscriptionName + ' ' + m.folder);

      client.command(['watch-project', m.folder],
          function (error, resp) {
            if (error) {
              console.error('Error initiating watch:', error);
              return;
            }

            // It is considered to be best practice to show any 'warning' or
            // 'error' information to the user, as it may suggest steps
            // for remediation
            if ('warning' in resp) {
              console.log('\x1b[33mwarning: %s\x1b[0m', resp.warning);
            }

            console.log('\x1b[36mwatch established on: %s Relative_path:%s\x1b[0m',
                      resp.watch, resp.relative_path);

            make_subscription(client, resp.watch, resp.relative_path, m.subscriptionName)

          });
    });
  }
);

 // Subscription results are emitted via the subscription event.
  // Note that this emits for all subscriptions.  If you have
  // subscriptions with different `fields` you will need to check
  // the subscription name and handle the differing data accordingly.
  // `resp`  looks like this in practice:
  //
  // { root: '/private/tmp/foo',
  //   subscription: 'mysubscription',
  //   files: [ { name: 'node_modules/fb-watchman/index.js',
  //       size: 4768,
  //       exists: true,
  //       type: 'f' } ] }
 client.on('subscription', function (resp) {

    mainWindow.webContents.send('onFolderSubscription', {
      msg: {
        subscription: resp.subscription,
        time: 0 //file.mtime_ms
      }
    });

    resp.files.forEach(function (file) {
        // convert Int64 instance to javascript integer
        const mtime_ms = +file.mtime_ms;

        console.log('file changed: ' + file.name, mtime_ms);
    });
 });

 // `watch` is obtained from `resp.watch` in the `watch-project` response.
 // `relative_path` is obtained from `resp.relative_path` in the
 // `watch-project` response.
function make_subscription(client, watch, relative_path, subscriptionName) {

    const sub = {
      // Match any ()`*.*`) file in the dir_of_interest
      expression: ["allof", ["match", "*.*"]],
      // Which fields we're interested in
      fields: ["name", "size", "mtime_ms", "exists", "type"]
    };
    if (relative_path) {
        sub.relative_root = relative_path;
    }

    client.command(['subscribe', watch, subscriptionName, sub],

      function (error, resp) {
        if (error) {
          // Probably an error in the subscription criteria
          console.error('\x1b[41mFailed to subscribe: %s\x1b[0m', error);
          return;
        }

        console.log('Subscription ' + resp.subscribe + ' established');
      });
};

// Prevent window being garbage collected
let mainWindow;

function onClosed() {
	// Dereference the window
	// For multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 600,
		height: 400
	});

	win.loadURL(`file://${__dirname}/app.html`);
  win.openDevTools();
	win.on('closed', onClosed);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  win.webContents.on('did-finish-load', () => {
     if (!mainWindow) {
       throw new Error('"mainWindow" is not defined');
     }
     win.show();
     win.focus();

     win.webContents.send('initStore', {
       msg: monitors
     });

  });

	return win;
}

const installExtensions = async () => {

   const installer = require('electron-devtools-installer');
   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
   const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
    ];

   return Promise
      .all(extensions.map(name => installer.default(installer[name], forceDownload)))
      .catch(console.error);

}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', async() => {

  await installExtensions();

	mainWindow = createMainWindow();

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  ipcMain.on('async-message', (event, props) => {

    const folder =
      dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
      });

    console.log(folder + ' added');
  });

});
