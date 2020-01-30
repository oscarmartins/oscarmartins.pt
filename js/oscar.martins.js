'use strict'
const cubes =  document.querySelectorAll('.cube');
const consoleMonitor = document.querySelector('div.console');
const statusSite = document.querySelector('.status-site');
const textarea = document.querySelector('.term');
const consolem = document.querySelector('div.console-monitor');
const consoleToolbar = document.querySelector('.console-toolbar');
const consoleFooter = document.querySelector('.console-footer');
const body = document.body, html = document.documentElement;
/**document.documentElement.scrollHeight*/
const doc_height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
const doc_width =  Math.max( body.scrollHeight, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
var updateScrollInterval = 0;
var cubes_height = 0;
cubes.forEach(function (cube) {
    cube.style.position = 'absolute';
    cube.style.left = '0';
    cube.style.top = cubes_height.toString() + 'px';
    cubes_height += cube.offsetHeight;
    cube.className += ' fade-out'; 
    cube.addEventListener('click', function (event) {
        event.preventDefault();
        if (moveRightInterval) {
            clearInterval(moveRightInterval);
            moveRightInterval = null;
            sendMsg('stop');
        } else {
            setTimeout(moveCubes, -1, 'L');
            sendMsg('start');
        }   
    }, true);
});
var cube_height = (cubes_height / cubes.length),
cancel_cube_interval = false,
moveRightInterval,
index=1,
last_cube,
moveLeft=0,
cubes_blocked=[],
cube_interval,
move_type,
looper=true,
msg_status_timer;

function sendMsgStatus (txtStatus, clear) {
    if (msg_status_timer)
        clearTimeout(msg_status_timer);
    statusSite.className = statusSite.className.replace(/\b blink_me\b/,'');
    statusSite.innerHTML = '';
    statusSite.appendChild(document.createTextNode(txtStatus));
    if (typeof clear !== 'undefined') {
        clear = typeof clear === 'number' ? clear : -1;
        msg_status_timer = setTimeout(sendMsgStatus, clear, ' ');
    }
    statusSite.className += ' blink_me';
}

function moveToTop (last_cube) {
    var X_Y = parseInt(last_cube.style.top) - cube_height;
    last_cube.style.top = X_Y.toString() + 'px';
    return 'T';
}

function moveCubes (mt, callback) {
    sendMsgStatus('waiting for admin..');
    index=1;
    move_type = mt || 'R';
    moveRightInterval = setInterval(() => {
        last_cube = cubes[cubes.length - index++];
        var Y = parseInt(last_cube.style.top) + cube_height;
        if ((Y+cube_height) > doc_height) { 
            var Y_X = parseInt(last_cube.style.left) + cube_height;
            if ((Y_X + cube_height) <= doc_width) {
                last_cube.style.left = Y_X.toString() + 'px';
            } else { 
                move_type = moveToTop(last_cube);
            }
        } else {
            if (move_type === 'R' || (move_type === 'L' && parseInt(last_cube.style.left) <= 0)) {
                if(looper === false && parseInt(last_cube.style.top) / cube_height === 4 && parseInt(last_cube.style.left) === 0 && index === 2 && move_type === 'L') {
                    clearInterval(moveRightInterval);
                    moveRightInterval = null;
                    looper = true;
                    sendMsgStatus('user admin is online..', 3000);
                    if (typeof callback === 'function') callback();
                    return;
                }
                looper = false;
                last_cube.style.top = Y.toString() + 'px';
            } else {
                if (parseInt(last_cube.style.top) <= 0 && parseInt(last_cube.style.left) > 0) {
                    var Y_X = parseInt(last_cube.style.left) - cube_height;
                    last_cube.style.left = Y_X.toString() + 'px';
                    move_type = 'L';
                } else {
                    move_type = moveToTop(last_cube);
                }
            }
        }
        if (index > cubes.length) index = 1;
    }, 15);
}

/**setTimeout(moveCubes, -1, 'L');**/

function sendMsg (msg) {
    /**
    let row_span = document.createElement('span');
    row_span.appendChild(document.createTextNode(msg));
    consoleMonitor.appendChild(row_span);
    consoleMonitor.scrollTo(0, consoleMonitor.scrollHeight);
     */
}

function Typing (phrase) {
    this.i = 0;
    this.phrase = phrase;
    this.typing = function () {
        setTimeout(function (a) {
            textarea.appendChild(document.createTextNode(a.phrase.charAt(a.i)));
            a.i++;
            if (a.i < a.phrase.length) {
                a.typing();
            } else {
                textarea.appendChild(document.createElement("br"));
                a.i = 0;
            }
            }, 100, this);
    }
}

const APP = {
    nano: (options) => {
        this.opt = options;
        this.changeModified = function (isModified) {
            var modified = document.querySelector('span#nano_modified');
            modified.innerHTML = '';
            if (isModified)
                modified.appendChild(document.createTextNode('modified'));
        };
        this.initTypewriter = function (typewriter) {
            if ('target' in typewriter)
                return new Typewriter(typewriter.target, (typewriter.options || {}));
            return null;
        }

        this.typewriter = this.initTypewriter(this.opt.typewriter || {});

        this.appcontext = function (open) {
            if (open) {
                sendMsgStatus('opening [nano]..');
                consolem.classList.add('fade-out');
                setTimeout(() => {
                    consoleToolbar.classList.add('nano');
                    consoleFooter.classList.add('nano');
                    consolem.classList.add('nano');
                    textarea.classList.add('nano');
                    sendMsgStatus('in progress..', 500);
                    consolem.classList.remove('fade-out');
                    if (this.status == 'closed') {
                        this.status = 'opened';
                        this.typewriter = this.fn.initTypewriter(this.options.typewriter || {});
                    }
                }, 500);
            } else {
                sendMsgStatus('closing [nano]..');
                consolem.classList.add('fade-out');
                setTimeout(() => {
                    consoleToolbar.classList.remove('nano');
                    consoleFooter.classList.remove('nano');
                    consolem.classList.remove('nano');
                    textarea.classList.remove('nano');
                    consolem.classList.remove('fade-out');
                    this.typewriter.state.elements.container.innerHTML = '';
                    this.changeModified(false);
                    sendMsgStatus('closing [nano]..', 1000);
                    this.status = 'closed';
                }, 500);
            }
        };
        this.status = '';
        if (typeof this.opt !== 'undefined') {
            this.status = this.opt.action;
            switch (this.opt.action) {
                case 'open':
                    this.appcontext(true);
                    break;
                case 'close':
                    this.appcontext(false);
                    break;
                default:
                    break;
            }
        }

        return {
            status: this.status,
            options: this.opt,
            fn: {
                initTypewriter: this.initTypewriter,
                changeModified: this.changeModified
            },
            appcontext: this.appcontext,
            changeModified: this.changeModified,
            typewriter: this.typewriter
        }
    }
}

function updatePageContainer () {
    var pagecontainer = document.querySelector('.page-container');
    pagecontainer.scrollTo(0 , pagecontainer.scrollHeight - pagecontainer.offsetHeight);
}

function helpInfo () {
    const help_info_txt = [
        'Hi, ',
        'I am a Full-Stack Java/Javascript Developer based in Lisbon, Portugal.',
        'About me',
        'I prefer to define myself by the work I have to do and not by what has already been done. I spend most of my time transforming complex problems into simple and intuitive projects. When I\'m not coding, I spend my time learning and doing interesting things, challenging myself.',
        'Some facts',
        ' · I a crazy for drones',
        ' · I drink a lot of coffee',
        ' · I\'m addicted to Sushi',
        ' · I love Animals',
    ];
    textarea.innerHTML = 'oscar.martins@dev:~$ ';
    consolem.classList.remove('fade-out');
    consolem.style.position = 'relative';
    consolem.style.display = 'block';
    
    const editornano = APP.nano({action: '', typewriter: {target: textarea, options: {loop: false,delay: 75}}});

    /**var typewriter = new Typewriter(textarea, {loop: false,delay: 75});**/
    
    editornano.typewriter
    .pauseFor(2500)
    .callFunction(() => {
        sendMsgStatus('the admin is typing...');
        updateScrollInterval = setInterval(updatePageContainer, 1);
    })
    .typeString(' <span class="console-cmd-nano">nano empty.txt  </span><br>')
    .callFunction(() => {
        /*
        sendMsgStatus('opening [nano]..');
        consolem.classList.add('fade-out');
        */
       editornano.appcontext(true);
    })
    .pauseFor(1000)
    .callFunction(() => {
        const consoleCmdNano = document.querySelector('.console-cmd-nano');
        consoleCmdNano.parentElement.removeChild(consoleCmdNano);
        /**
        consoleToolbar.classList.add('nano');
        consoleFooter.classList.add('nano');
        consolem.classList.add('nano');
        textarea.classList.add('nano');
        sendMsgStatus('in progress..');
        consolem.classList.remove('fade-out');
        */
    })
    .pauseFor(2500)
    .callFunction(() => {
        sendMsgStatus('the admin is typing...');
    })
    .typeString('Hi, <br>')
    .callFunction(() => {
        editornano.changeModified(true);
    })
    
    .pauseFor(300)
    .typeString('My name is Oscar Martins ')
    .pauseFor(300)
    .deleteChars('My name is Oscar Martins '.length)
    .typeString('I am a Full-Stack Java/Javascript Developer based in Lisbon, Portugal.')
    .pauseFor(300)
    .typeString('<h4 class="console-h4">About me</h4>')
    .pauseFor(400)
    .typeString('I prefer to define myself by the work I have to do and not by what has already been done. ')
    .pauseFor(300)
    .typeString('I spend most of my time transforming complex problems into simple and intuitive projects. ')
    .pauseFor(400)
    .typeString('When I\'m not coding, I spend my time learning and doing interesting things, challenging myself.')
    .pauseFor(500)
    .typeString('<h4 class="console-h4">Some facts</h4>')
    .pauseFor(300)
    .typeString(' · I a crazy for drones <br>')
    .pauseFor(300)
    .typeString(' · I drink a lot of coffee <br>')
    .pauseFor(300)
    .typeString(' · I\'m addicted to Sushi <br>')
    .pauseFor(300)
    .typeString(' · I love Animals <br>')
    .pauseFor(600)
    .callFunction(() => {
        sendMsgStatus('the admin is typing...', 100);
        clearInterval(updateScrollInterval);
    })
    .pauseFor(2000)
    .callFunction(() => {
        editornano.appcontext(false);
    })
    /*.changeCursor('oscar.martins@dev:~$')*/
    .start();
    
}

const matrix_nano = [
    ['R', 'B'],
    ['T', 'R'], 
    ['L', 'R', 'B'], 
    ['L', 'T', 'R'], 
    ['L', 'B', 'R'], 
    ['L', 'T', 'R'], 
    ['L', 'B'], 
    ['T', 'L']
];

const lirows = document.querySelectorAll('ul.row li span');

document.addEventListener('keydown', function(event) {

    if (event.ctrlKey) {
        for (var n = 0; n < lirows.length; n++) {
            lirows[n].classList.add('blue');
        }
    } 
    if (event.ctrlKey && event.key === 'X') {
      setTimeout(() => {
        alert('Take a control?');   
      }, 1);     
    }
  });

  document.addEventListener('keyup', function(event) {

    for (var n = 0; n < lirows.length; n++) {
        lirows[n].classList.remove('blue');
    }

  });

/**
  const sseSource = new EventSource('/event-stream');
  sseSource.addEventListener('message', (e) => {
      const messageData = e.data;
      console.log(messageData);
  });
**/
// When finished with the source close the connection
/*sseSource.close();**/
