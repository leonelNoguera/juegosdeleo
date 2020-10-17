var socket = io();
/* Variables */
var user;
var id;
var users = [];
//var users = [['u1', 0], ['u2', 1000], ['u3', 50]];
var selectedUser;
var words;
var timer;
var socket;
var oldname;
var username;
var roomCode;
var privateRoom = false;
var typeTimer;
var clients = [];
var nmr = 0;
var dev = true;
var unread = 0;
var focus = true;
var connected = false;
var regex = /(&zwj;|&nbsp;)/g;
var settings = {
    'name': null,
    'emoji': true,
    'greentext': true,
    'inline': true,
    'sound': true,
    'desktop': false,
    'synthesis': false,
    'recognition': false
};
var d;
/* Config */
emojione.ascii = true;
emojione.imageType = 'png';
emojione.unicodeAlt = false;
socket.on('update', (data) => {
    if (username != undefined)
    {
        console.log(data);
        username = username.split('_')[0];//pendiente mejorar
        if (data['user'] == username)
        {
            document.getElementById('waiting').style.display = 'block';
            document.getElementById(wordsInfo).style.display = 'block';
            document.getElementById('divLogin').style.display = 'none';
            roomCode = data['roomCode'];        
            id = data['id'];
            for (var i = 0; i < data['usersInRoom'].length; i++)
            {
                var f = false;
                for (var j = 0; j < users.length; j++)
                {
                    if (users[j][0] == data['usersInRoom'][i])
                    {
                        f = true;
                    }
                }
                if (!f)
                {
                    users.push([data['usersInRoom'][i], 0]);
                    updateUsersInfo();
                }
            }
            if (users.length > 1)
            {
                document.getElementById(panelMessages).style.display = 'block';
            }
            if (users.length > 2)
            {
                handleNewUserNeedsInfo();
            }
            document.getElementById(lblRoomCode).innerHTML = 'El código de sala es: ' + roomCode;

            if ((data['selectedUser'] != undefined) && (data['selectedUser'] != ''))
            {
                selectedUser = data['selectedUser'];
                updateUsersInfo();
                if (data['selectedUser'] == username)
                {
                    words = data['words'];
                    var w = document.getElementById(wordsInfo);
                    w.style.display = 'flex';
                    w.innerHTML = '';
                    var html = '';
                    if (!data['full'])
                    {
                        document.getElementById('waiting').style.display = 'block';
                    }
                    else
                    {
                        document.getElementById('waiting').style.display = 'none';
                    }
                    html += '<label>Seleccione una palabra: </label>';
                    for (var i = 0; i < words.length; i++)
                    {
                        html += '<button id="w_' + i + '" onclick="selectWord(this.id);">' + words[i] + '</button><br>';
                    }
                    w.innerHTML = html;
                    document.getElementById('send').childNodes[0].nodeValue = 'Send';
                    updateBar('mdi-content-send', 'Escriba aquí', false);
                    document.getElementById(privateRoom).style.display = 'none';
                }
                else
                {
                    var html = '';
                    if (!data['full'])
                    {
                        document.getElementById('waiting').style.display = 'block';
                    }
                    else
                    {
                        document.getElementById('waiting').style.display = 'none';
                    }
                    html += '<label>' + data['selectedUser'] + ' está seleccionando una palabra.</label>';
                    document.getElementById(wordsInfo).innerHTML = html;
                    document.getElementById('send').childNodes[0].nodeValue = 'Send';
                    updateBar('mdi-content-send', 'Escriba aquí', false);
                }
                document.getElementById(roundInfo).innerHTML = 'Ronda: ' + data['round'][0] + ' of ' + data['round'][1];
            }
        }
        else
        {
            if ((data['roomCode'] != undefined) && (data['roomCode'] != '')  && (data['roomCode'] == roomCode))
            {
                document.getElementById('rBtn').style.display = 'none';
                document.getElementById('rBtn2').style.display = 'none';
                //id = data['id'];
                for (var i = 0; i < data['usersInRoom'].length; i++)
                {
                    var f = false;
                    for (var j = 0; j < users.length; j++)
                    {
                        if (users[j][0] == data['usersInRoom'][i])
                        {
                            f = true;
                        }
                    }
                    if (!f)
                    {
                        users.push([data['usersInRoom'][i], 0]);
                    }
                }
                if (users.length > 1)
                {
                    document.getElementById(panelMessages).style.display = 'block';
                }
                updateUsersInfo();
                if (users.length > 1)
                {
                    points = [];
                    changeSize();
                    selectedUser = data['selectedUser'];
                    updateUsersInfo();
                    if ((data['selectedUser'] != undefined) && (data['selectedUser'] != ''))
                    {
                        if (data['selectedUser'] == username)
                        {
                            var html = '';
                            if (!data['full'])
                            {
                                document.getElementById('waiting').style.display = 'block';
                            }
                            else
                            {
                                document.getElementById('waiting').style.display = 'none';
                            }
                            html += '<label>Seleccione una palabra: </label>';
                            words = data['words'];
                            var w = document.getElementById(wordsInfo);
                            w.style.display = 'flex';
                            w.innerHTML = '';
                            for (var i = 0; i < words.length; i++)
                            {
                                html += '<button id="w_' + i + '" onclick="selectWord(this.id);">' + words[i] + '</button>';
                            }
                            w.innerHTML = html;
                        }
                        else
                        {
                            var html = '';
                            if (!data['full'])
                            {
                                document.getElementById('waiting').style.display = 'block';
                            }
                            else
                            {
                                document.getElementById('waiting').style.display = 'none';
                            }
                            html += '<label>' + data['selectedUser'] + ' está seleccionando una palabra.</label>';
                            document.getElementById(wordsInfo).innerHTML = html;
                        }
                        document.getElementById(roundInfo).innerHTML = 'Ronda: ' + data['round'][0] + ' of ' + data['round'][1];
                    }
                    updateBar('mdi-content-send', 'Escriba aquí', false);
                    document.getElementById('privateRoom').style.display = 'none';
                    connected = true;
                    settings.name = username;
                    localStorage.settings = JSON.stringify(settings);
                }
            }
        }
    }
});
socket.on('rematch', (data) => {
    if (data['roomCode'] == roomCode)
    {
        showChat(data.type, '', 'Juego reiniciado.', '', '');
        document.getElementById('rBtn').style.display = 'none';
        document.getElementById('rBtn2').style.display = 'none';
        for (var i = 0; i < users.length; i++)
        {
            users[i][1] = 0;
        }
        document.getElementById(panelMessages).style.display = 'block';
        document.getElementById(messageInput).style.display = 'block';
        document.getElementById(send).style.display = 'block';
        document.getElementById('privateRoom').style.display = 'none';
        points = [];
        changeSize();
        selectedUser = data['selectedUser'];
        updateUsersInfo();
        if ((data['selectedUser'] != undefined) && (data['selectedUser'] != ''))
        {
            document.getElementById('waiting').style.display = 'none';
            if (!data['full'])
            {
                document.getElementById('waiting').style.display = 'block';
            }
            if (data['selectedUser'] == username)
            {
                words = data['words'];
                document.getElementById(wordsInfo).style.display = 'flex';
                document.getElementById(wordsInfo).innerHTML = '';
                var html = '<label>Seleccione una palabra: </label>';
                for (var i = 0; i < words.length; i++)
                {
                    html += '<button id="w_' + i + '" onclick="selectWord(this.id);">' + words[i] + '</button>';
                }
                document.getElementById(wordsInfo).innerHTML = html;
            }
            else
            {
                document.getElementById(wordsInfo).innerHTML = '<label>' + data['selectedUser'] + ' está seleccionando una palabra.</label>';
            }
            document.getElementById(roundInfo).innerHTML = 'Ronda: ' + data['round'][0] + ' of ' + data['round'][1];
        }
        document.getElementById('send').childNodes[0].nodeValue = 'Send';
        updateBar('mdi-content-send', 'Escriba aquí', false);
        document.getElementById('privateRoom').style.display = 'none';
    }
});
socket.on('userDisconected', (data) => {
    if (data['roomCode'] == roomCode)
    {
        showChat(data.type, '', data['user'] + ' disconnected.', '', '');
        var auxUsers = [];
        for (var i = 0; i < users.length; i++)
        {
            if (users[i][0] != data['user'])
            {
                auxUsers.push(users[i]);
            }
        }
        updateUsersInfo();
        users = [...auxUsers];
        if (users.length < 2)
        {
            canvasDisplay = 'none';
            changeSize();
            document.getElementById(panelMessages).style.display = 'none';
            document.getElementById(roundInfo).innerHTML = '';
            stopTime = true;
            document.getElementById(timeInfo).innerHTML = 'Segundos restantes: ' + time;
            document.getElementById(wordsInfo).innerHTML = '';
            document.getElementById('waiting').style.display = 'none';
            document.getElementById(drawingToolsDiv).style.display = 'none';
            selectedUser = undefined;
            if (data['subType'] == 'gameOver')
            {
                canvas.removeEventListener('touchstart', onTouch, false);
                canvas.removeEventListener('touchend', onTouchUp, false);
                canvas.removeEventListener('mouseup', onUp, false);
                canvas.removeEventListener('mousemove', onMove, false);
                document.getElementById(drawingToolsDiv).style.display = 'none';
                document.getElementById(panelMessages).style.display = 'block';
                showChat(data.type, '', 'La palabra era \'' + data['word'] + '\'.', '', '');
                stopTime = true;
                points = [];
                drawer = false;
                changeSize();
                selectedUser = '';
                if (data['puntuation'] != undefined)
                {
                    for (var i = 0; i < users.length; i++)
                    {
                        //if (users[i][0] == data['user'])
                        {
                            users[i][1] = data['puntuation'][i];
                            //i = users.length;
                        }
                    }
                    updateUsersInfo();
                    if (data['winners'].length > 1)
                    {
                        var names = data['winners'][0][0];
                        for (var i = 1; i < data['winners'].length; i++)
                        {
                            names += ', ' + data['winners'][i][0];
                        }
                        showChat(data.type, '', 'Winners: ' + names + '.', '', '', 15);
                    }
                    else
                    {
                        showChat(data.type, '', 'Winner: ' + data['winners'][0][0] + '.', '', '', 15);
                    }
                }
                else
                {//Cuando se hace rematch luego de terminar el juego por abandono.
                    document.getElementById('rBtn2').style.display = 'block';
                }
                showChat(data.type, '', 'Juego terminado.', '', '');
                //document.getElementById('rBtn').style.display = 'block';
            }
        }
        else
        {
            if (data['subType'] == 'reasignedSelectedUser')
            {
                stopTime = true;
                selectedUser = data['selectedUser'];
                updateUsersInfo();
                if (data['selectedUser'] == username)
                {
                    words = data['words'];
                    var w = document.getElementById(wordsInfo);
                    w.style.display = 'flex';
                    w.innerHTML = '';
                    var html = '';
                    if (!data['full'])
                    {
                        document.getElementById('waiting').style.display = 'block';
                    }
                    else
                    {
                        document.getElementById('waiting').style.display = 'none';
                    }
                    html += '<label>Seleccione una palabra: </label>';
                    for (var i = 0; i < words.length; i++)
                    {
                        html += '<button id="w_' + i + '" onclick="selectWord(this.id);">' + words[i] + '</button>';
                    }
                    w.innerHTML = html;
                    document.getElementById('send').childNodes[0].nodeValue = 'Send';
                    updateBar('mdi-content-send', 'Escriba aquí', false);
                    document.getElementById(privateRoom).style.display = 'none';
                }
                else
                {
                    var html = '';
                    if (!data['full'])
                    {
                        document.getElementById('waiting').style.display = 'block';
                    }
                    else
                    {
                        document.getElementById('waiting').style.display = 'none';
                    }
                    html += '<label>' + data['selectedUser'] + ' está seleccionando una palabra.</label>';
                    document.getElementById(wordsInfo).innerHTML = html;
                    document.getElementById(wordsInfo).style.display = 'flex';
                    document.getElementById('send').childNodes[0].nodeValue = 'Send';
                    updateBar('mdi-content-send', 'Escriba aquí', false);
                }
                document.getElementById(roundInfo).innerHTML = 'Ronda: ' + data['round'][0] + ' of ' + data['round'][1];
            }
        }
        updateUsersInfo();
    }
});
socket.on('returningGameInfo', (data) => {
    if ((data['roomCode'] == roomCode) && (data['user'] == username))
    {
        if ((data['selectedUser'] != undefined) && (data['selectedUser'] != ''))
        {
            var html = '';
            if (!data['full'])
            {
                document.getElementById('waiting').style.display = 'block';
            }
            else
            {
                document.getElementById('waiting').style.display = 'none';
            }
            html += '<label>' + data['selectedUser'] + ' está seleccionando una palabra.</label>';
            document.getElementById(wordsInfo).innerHTML = html;
            document.getElementById(roundInfo).innerHTML = 'Ronda: ' + data['round'][0] + ' of ' + data['round'][1];
            selectedUser = data['selectedUser'];
            updateUsersInfo();
            document.getElementById('send').childNodes[0].nodeValue = 'Send';
            updateBar('mdi-content-send', 'Escriba aquí', false);
            document.getElementById('privateRoom').style.display = 'none';
        }
    }
});
socket.on('startDrawing', (data) => {
    if (data['roomCode'] == roomCode)
    {
        canvasDisplay = 'block';
        points = [];
        changeSize();
        stopTime = false;
        initTime();
        selectedUser = data['selectedUser'];
        updateUsersInfo();
        if (data['selectedUser'] == username)
        {
            changeSize(true);
            document.getElementById('send').childNodes[0].nodeValue = 'Send';
            updateBar('mdi-content-send', 'Escriba aquí', false);
        }
        else
        {
            document.getElementById(wordsInfo).style.display = 'flex';
            showWordLength(data['wordLength']);
            document.getElementById('send').childNodes[0].nodeValue = 'Send';
            updateBar('mdi-content-send', 'Escriba aquí', false);
            document.getElementById('privateRoom').style.display = 'none';
        }
    }
});
socket.on('nextTurn', (data) => {
    if (data['roomCode'] == roomCode)
    {
        canvas.removeEventListener('touchstart', onTouch, false);
        canvas.removeEventListener('touchend', onTouchUp, false);
        canvas.removeEventListener('mouseup', onUp, false);
        canvas.removeEventListener('mousemove', onMove, false);
        document.getElementById(drawingToolsDiv).style.display = 'none';
        if (data['timeOut'])
        {
            showChat(data.type, '', 'Tiempo fuera.', '', '');
        }
        if ((data['user'] != '') && (data['user'] != undefined))
        {
            showChat(data.type, '', data['user'] + ' acertó la palabra', '', '', 15);
        }
        showChat(data.type, '', 'La palabra era \'' + data['word'] + '\'.', '', '');
        stopTime = true;
        points = [];
        drawer = false;
        changeSize();
        selectedUser = data['selectedUser'];
        for (var i = 0; i < users.length; i++)
        {
            users[i][1] = data['puntuation'][i];
        }
        updateUsersInfo();
        if (data['selectedUser'] != '')
        {
            if (data['selectedUser'] == username)
            {
                var html = '';
                if (!data['full'])//No funciona.
                {
                    document.getElementById('waiting').style.display = 'block';
                }
                else
                {
                    document.getElementById('waiting').style.display = 'none';
                }
                html += '<label>Seleccione una palabra: </label>';
                words = data['words'];
                var w = document.getElementById(wordsInfo);
                w.style.display = 'flex';
                w.innerHTML = '';
                for (var i = 0; i < words.length; i++)
                {
                    html += '<button id="w_' + i + '" onclick="selectWord(this.id);">' + words[i] + '</button>';
                }
                w.innerHTML = html;
                document.getElementById('send').childNodes[0].nodeValue = 'Send';
                updateBar('mdi-content-send', 'Escriba aquí', false);
            }
            else
            {
                var html = '';
                if (!data['full'])
                {
                    document.getElementById('waiting').style.display = 'block';
                }
                else
                {
                    document.getElementById('waiting').style.display = 'none';
                }
                html += '<label>' + data['selectedUser'] + ' está seleccionando una palabra.</label>';
                document.getElementById(wordsInfo).innerHTML = html;
                document.getElementById('send').childNodes[0].nodeValue = 'Send';
                updateBar('mdi-content-send', 'Escriba aquí', false);
                document.getElementById('privateRoom').style.display = 'none';
            }
            document.getElementById('roundInfo').innerHTML = 'Ronda: ' + data['round'][0] + ' of ' + data['round'][1];
        }
    }
});
socket.on('gameOver', (data) => {
    if (data['roomCode'] == roomCode)
    {
        canvas.removeEventListener('touchstart', onTouch, false);
        canvas.removeEventListener('touchend', onTouchUp, false);
        canvas.removeEventListener('mouseup', onUp, false);
        canvas.removeEventListener('mousemove', onMove, false);
        document.getElementById(drawingToolsDiv).style.display = 'none';
        if (data['timeOut'])
        {
            showChat(data.type, '', 'Tiempo fuera.', '', '');
        }
        if ((data['user'] != '') && (data['user'] != undefined))
        {
            showChat(data.type, '', data['user'] + ' guessed the word!', '', '', 15);
        }
        showChat(data.type, '', 'La palabra era \'' + data['word'] + '\'.', '', '');
        stopTime = true;
        points = [];
        drawer = false;
        changeSize();
        selectedUser = '';
        for (var i = 0; i < users.length; i++)
        {
            users[i][1] = data['puntuation'][i];
        }
        updateUsersInfo();
        if (data['winners'].length > 1)
        {
            var names = data['winners'][0][0];
            for (var i = 1; i < data['winners'].length; i++)
            {
                names += ', ' + data['winners'][i][0];
            }
            showChat(data.type, '', 'Ganadores: ' + names + '.', '', '', 15);
        }
        else
        {
            showChat(data.type, '', 'Ganador: ' + data['winners'][0][0] + '.', '', '', 15);
        }
        showChat(data.type, '', 'Juego terminado.', '', '');

        document.getElementById('rBtn').style.display = 'block';
        document.getElementById('rBtn2').style.display = 'none';
    }
});
socket.on('wrongWord', (data) => {
    if (data['roomCode'] == roomCode)
    {
        showChat(data.type, data.user, data['guess'], '', '');
    }
});
socket.on('message', (data) => {
    if (data['roomCode'] == roomCode)
    {
        showChat(data.type, data.user, data['guess'], '', '');
    }
});
socket.on('drawing', (data) => {
    if ((data['roomCode'] == roomCode) && (selectedUser != username))
    {
        points = data['draw']['points'];
        var p = data['draw']['points'];
        for (var i = 0; i < p.length; i++)
        {
            //console.log(p[i]);
            ctx.beginPath();
            ctx.strokeStyle = p[i]['colour'];
            ctx.lineWidth = canvas.width * p[i]['lineWidth'];
            ctx.moveTo(canvas.width * p[i]['initial_pos'][0], canvas.height * p[i]['initial_pos'][1]);
            if (p[i]['others_pos'].length)
            {
                var sub_p = p[i]['others_pos'];
                for (var j = 0; j < sub_p.length; j++)
                {
                    ctx.lineTo(canvas.width * sub_p[j][0], canvas.height * sub_p[j][1]);
                }
                ctx.stroke();
            }
        }
    }
});
socket.on('error', (data) => {
    /*if ((id == undefined) || (data['id'] == id))//Pendiente revisar.
    {
        document.getElementById(panelMessages).style.display = 'block';
        showChat(data.type, data.user, data['error'], '', '');
        username = undefined;
    }*/
});
function updateBar(icon, placeholder, disable)
{
    document.getElementById('icon').className = 'mdi ' + icon;
    $('#' + messageInput).attr('placeholder', placeholder);
    $('#' + messageInput).prop('disabled', disable);
    $('#send').prop('disabled', disable);
}
function showChat(type, user, message, subtxt, mid, fontSize = null)
{
    var nameclass = '';
    if(type == 'global' || type == 'kick' || type == 'ban' || type == 'info' || type == 'light' || type == 'help' || type == 'role')
    {
        user = 'System';
    }
    if(type == 'me' || type == 'em')
    {
        type = 'emote';
    }
    if(!mid)
    {
        mid == 'system';
    }
    if(!subtxt)
    {
        if (fontSize == null)
        {
            $('#' + panel).append('<div data-mid="' + mid + '" class="' + type + '""><span class="name ' + nameclass + '"><b><a class="namelink" href="javascript:void(0)">' + user + '</a></b></span><span class="delete"><a href="javascript:void(0)">DELETE</a></span><br><span class="timestamp">' + getTime() + '</span><br><span class="msg">' + message + '</span></div>');
        }
        else
        {
            $('#' + panel).append('<div data-mid="' + mid + '" class="' + type + '""><span class="name ' + nameclass + '"><b><a class="namelink" href="javascript:void(0)">' + user + '</a></b></span><span class="delete"><a href="javascript:void(0)">DELETE</a></span><br><span class="timestamp">' + getTime() + '</span><br><span class="msg" style="font-size: ' + fontSize + 'pt; border: solid;">' + message + '</span></div>');
        }
    }
    else
    {
        $('#' + panel).append('<div data-mid="' + mid + '" class="' + type + '""><span class="name ' + nameclass + '"><b><a class="namelink" href="javascript:void(0)">' + user + '</a></b></span><span class="timestamp">(' + subtxt + ') ' + getTime() + '</span><br><span class="msg">' + message + '</span></div>');
    }
    $('#' + panel).animate({scrollTop: $('#' + panel).prop('scrollHeight')}, 500);
    //updateStyle();
    nmr++;
    if(settings.inline)
    {
        var m = message.match(/(https?|ftp):\/\/[^\s/$.?#].[^\s]*/gmi);

        if(m) {
            m.forEach(function(e, i, a) {
                // Gfycat Support
                if(e.indexOf('//gfycat') !== -1) {
                    var oldUrl = e;
                    e = e.replace('//gfycat.com', '//gfycat.com/cajax/get').replace('http://', 'https://');

                    $.getJSON(e, function(data) {
                        testImage(data.gfyItem.gifUrl.replace('http://', 'https://'), mid, oldUrl);
                    });
                } else {
                    testImage(e, mid, e);
                }
            });
        }
    }
}
function testImage(url, mid, oldUrl)
{
    var img = new Image();

    img.onload = function() {
        $('div[data-mid=' + mid + '] .msg a[href="' + oldUrl.replace('https://', 'http://') + '"]').html(img);
        $('#' + panel).animate({scrollTop: $('#' + panel).prop('scrollHeight')}, 500);
    };
    img.src = url;
}
function handleNewUserNeedsInfo()
{
    socket.emit('newUserNeedsInfo', JSON.stringify({
        type: 'newUserNeedsInfo',
        user: username, 
        roomCode: roomCode
    }));
}
function handleMsg()
{
    var value = $('#' + messageInput).val().replace(regex, ' ').trim();
    if ((selectedUser != undefined) && (selectedUser != ''))
    {
        socket.emit('guess', JSON.stringify({
            type: 'guess',
            user: username, 
            guess: value, 
            roomCode: roomCode
        }));
    }
    $('#' + messageInput).val('');
}
function handleLogin(private = false)
{
    var value = $('#userInput').val().replace(regex, ' ').trim();
    if (private)
    {
        roomCode = 'private';
        privateRoom = true;
    }
    else
    {
        if (!connected)
        {
            roomCode = $('#roomCode').val();
        }
    }
    if ((value.length > 0) && (!connected) && (username === undefined))
    {
        username = value + '_' + roomCode;
        //connect();
        var data = JSON.stringify({'type' : 'update', 'user' : username});
        socket.emit('update', data);
    }
    $('#userInput').val('');
    $('#roomCode').val('');
}
function handleCanvas(points)
{
    socket.emit('drawing', JSON.stringify({
        type: 'drawing',
        user: username + '_' + roomCode, 
        message: '', 
        draw: {'points' : points},
        roomCode: roomCode
    }));
}
function handleTimeOut()
{
    socket.emit('timeOut', JSON.stringify({
        type: 'timeOut', 
        roomCode: roomCode
    }));
}
function handleWordSelected(w)
{
    socket.emit('wordSelected', JSON.stringify({
        type: 'wordSelected', 
        word: w, 
        roomCode: roomCode
    }));
}
function getTime()
{
    var now = new Date();
    var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
 
    for(var i = 0; i < 3; i++)
    {
        if(time[i] < 10)
        {
            time[i] = '0' + time[i];
        }
    } 
    return time.join(':');
}