var socket = io('http://kzn-2015.ru:8080');


var lightbox = document.getElementById('lightbox');

function addImg(url) {
    var images = document.getElementById("images");
    var firstWrapper = images.getElementsByTagName("div")[0];
    var wrapper = document.createElement("a");
    wrapper.setAttribute('class', "img");
    wrapper.setAttribute('href', '/standard/' + url);

    var i = document.createElement("img");
    i.setAttribute('src', '/thumbs/' + url);
    i.className = 'fadeIn fadeIn-1s fadeIn-Delay-1s';


    wrapper.appendChild(i);
    images.insertBefore(wrapper, firstWrapper);


    i.addEventListener('click', function(e) {
        e.preventDefault();
        console.log(this, url);
        document.getElementById('content').innerHTML = '<img src="/standard/' + url + '">';
        lightbox.style.display = 'block';
    });

    lightbox.addEventListener('click', function() {
        lightbox.style.display = 'none';
    });




}

// document.querySelector('body').addEventListener('click', function(event) {
//     event.preventDefault();
//     if (event.target.tagName.toLowerCase() === 'img') {
//         var url = event.target.getAttribute('src');
//         console.log(url, this);
//         document.getElementById('content').innerHTML = 'хуй';
//         document.getElementById('lightbox').style.display = '';
//     }
// });

function clearAll() {
    document.getElementById("images").innerHTML = "";
}


socket.on('firstShow', function(data) {
    clearAll();
    data.data.forEach(function(img) {
        addImg(img);
    });
});

socket.on('newimage', function(img) {
    console.log(img);
    addImg(img.url);
});

socket.on('show', function(data) {
    console.log(data.url);
    addImg(data.url);
});