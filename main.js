const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg= require('resize-img');
const{ app, BrowserWindow, Menu, ipcMain, shell} = require ('electron');

//Globally scoping mainwindow temp
let mainWindow;
//Check or Dev mode
const isDev = process.env.NODE_ENV !== 'production';
//Checking if the current machine is Mac or Windows 
const isMac = process.platform === 'darwin'; 

//Creating main window
function createMainWindow()
{
    mainWindow = new BrowserWindow(
        {
            title: "Image Resizier",
            width: isDev ? 1000 : 500, 
            height: 600,
           webPreferences: {
            contextIsolation : true,
            nodeIntegration: true, // Ensure Node.js integration in renderer process
            preload: path.join(__dirname, 'preload.js')
        }   
        });

    //Open dev tools if in Dev env
   /* if(isDev)
        {
            mainWindow.webContents.openDevTools();
        }
    */

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));

}

//Create About window
function createAboutWindow()
{
    const aboutWindow = new BrowserWindow(
        {
            title: "About Window",
            width:  300, 
            height: 600,
           webPreferences: {
            nodeIntegration: true // Ensure Node.js integration in renderer process
        }
        });

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

//When app is ready
app.whenReady().then (() => {
    createMainWindow();

    //Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

//Remove mainwindow from memory when close
mainWindow.on('closed', () => (mainWindow = null));

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow()
        }
      })
});
//Menu Template
const menu =
[
    //Second window for Mac
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : []),
    {
       role: 'fileMenu',

     }, 
     //Second window for windows
     ...(!isMac ? [{
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
     }] : [])
];
//Respond to ipcRenderer resizie
ipcMain.on('image:resize', async (e, options) => 
{
    options.dest = path.join(os.homedir(), 'imageresizer')
    console.log(options);
    resizeImage(options); //call the resize function
});

//Resize the Image function
async function resizeImage({imgPath, inputwidth, inputheight, dest})
{
 try{
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
        width: +inputwidth,
        height: +inputheight,
    });
    //Create filename
    const filename =  path.basename(imgPath);

    //Create destination folder if not exist
    if(!fs.existsSync(dest))
    {
        fs.mkdirSync(dest);
    }
    //Write file to destination folder
    fs.writeFileSync(path.join(dest, filename), newPath);

    //Send success msg to renderer
    mainWindow.webContents.send('image:done');

    //Opening the image in the destination using electron shell
    shell.openPath(dest);
 }
    catch(error){
        console.log(error);
    }
}

// Quit the app when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
})
