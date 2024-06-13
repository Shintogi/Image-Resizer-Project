//USing  IPC render to call img and resizing
const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const OutputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const height = document.querySelector('#height');
const width = document.querySelector('#width');

//Event  listner
function loadImage(e)
{
    const file = e.target.files[0]; 
    // so like a pointer targeting / pointing to the function on the event listner line which has img
    if(!isFileImg(file)){ //make sure to pass in file
        alertError('Please select an image');
        return;
    }
    
    //displaying height and width blocks
   form.style.display = 'block';
   filename.innerText = file.name;
   //settings the output path
   OutputPath.innerText = path.join(os.homedir(), 'imageresizier');

    //Get original Diemensions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    //src means source 
    image.onload = function () {
      //  console.log(this.width)
        width.value = this.width;
        height.value = this.height;
       // outputInfo.innerText = ' ';
    }


}

//Send image data to main
function sendImage(e)
{
    e.preventDefault();

    const inputwidth = width.value;
    const inputheight = height.value;
    const imgPath = img.files[0].path;
    
    //make sure there is an img
    if(!img.files[0])
        {
            alertError('Please upload an Image');
            return;
        }
    if (inputwidth === '' || inputheight === '')
        {
            alertError('Please fill in width and height')
            return;
        }
    //send to main using IPCRenderer
        ipcRenderer.send('image:resize', {
        imgPath,
        inputwidth,
        inputheight,
        });

        //Using Ipc renderer to catch image:done event
        ipcRenderer.on('image:done', () => {
            alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value}`);   
        })
}

 //check to make sure first item is an img
 function isFileImg(file){  
    const acceptedImageTypes = ['image/gif', 'image/png', 'image/png', 'image/jpeg'];
    //return true or false
    return file && acceptedImageTypes.includes(file['type']);
 }
// functions that go with the toastfiy context bridge in the preload function
function alertError(message) {
    Toastify.toast({
        text:message,
        duration: 500,
        close: false,
        style:{
            background: 'red',
            color: 'purple',
            textAlign: 'center'
        }

    });
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage); // sending an event to the main process to do the resizing