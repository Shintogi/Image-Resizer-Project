const os = require('os');
const path = require('path');
const Toastify = require ('toastify-js')
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('os', {
 homedir: () => os.homedir()
});
contextBridge.exposeInMainWorld('path',
    {
       join: (...args) =>  path.join(...args),
    });

    //method called toast calls a method called show toast.
    contextBridge.exposeInMainWorld('Toastify',{
        toast : (optioins) => Toastify(optioins).showToast(),
    });
    
    //IPC Renderer
    contextBridge.exposeInMainWorld('ipcRenderer',{
        send: (channel, data) => 
            ipcRenderer.send(channel, data),
        //send takes channel and data and call ipc renderer and pass in channel and data
        on: (change, func) => 
            ipcRenderer.on(channel, (event, ...args) => func(...args)),
        //On takes channel and a function and calls them with ipc render.on 
        //for func: use function even to call func and take in any arguments 
    });