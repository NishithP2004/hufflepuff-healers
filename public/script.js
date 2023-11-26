var image = null;
const socket = io();
// client-side
socket.on("connect", () => {
    console.log("Connected to " + socket.id); // x8WIv7-mJelg7on_ALbx
    document.getElementById("status").innerText = "Connected to " + socket.id;
});

socket.on('message', async data => {
    if (data.id != socket.id) {
        console.log(data.msg)
    }
})

socket.on('reply', data => {
    if (data.id != socket.id) {
        handleMessage(data)
    }
})

function handleFileSelect() {
    const fileInput = document.getElementById('image');

    if (fileInput.files.length > 0) {
        const selectedFile = fileInput.files[0];

        console.log('File Name:', selectedFile.name);
        console.log('File Type:', selectedFile.type);
        console.log('File Size:', selectedFile.size, 'bytes');

        const reader = new FileReader();

        reader.onload = function (e) {
            const fileContent = e.target.result;
            console.log('File Content:', fileContent);
            image = fileContent;
        };

        reader.readAsArrayBuffer(selectedFile)
    } else {
        console.log('No file selected');
    }
}

let form = document.forms[0];
form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    let msg = form["message"].value;
    let data = {
        msg,
        from: sessionStorage.getItem("name"),
        image
    }
    handleMessage(data);
    form['message'].value = "";
    console.log(msg)
    socket.emit('message', {
        data,
        id: socket.id
    })
    image = null;
    form.reset()
    return false;
})

function handleMessage(data) {
    let chat = document.querySelector("#chat-container > ul");
    let li = document.createElement('li');
    li.innerHTML =
        `
<div class='bubble glass'>
    <p class='from'>${data.from}</p>
    <p class='body'>${data.msg}</p> 
</div>
`
    chat.appendChild(li)
    chat.scrollTo(0, document.body.scrollHeight);
}

document.addEventListener('DOMContentLoaded', (ev) => {
    handleMessage({
        from: "SYSTEM",
        msg: `Welcome ${sessionStorage.getItem("name")}, type in your symptoms and upload an image of your skin condition to receive meaningful insights on the same.`
    })
})

function signOut() {
    firebaseui.auth.getInstance().signOut()
    .then(() => {
        window.location.href='/login'
    })
}