var addButton = document.getElementById('add');
var addInput = document.getElementById('task');

addButton.addEventListener('click', getValue);
addInput.addEventListener('keypress', taskKeypress);

var todo = document.getElementById('todo');
var taskTemplate = document.getElementById('task-template').innerHTML;

var url = 'http://rest.learncode.academy/api/tony/testing';

function getValue() {
	var value = addInput.value;
    if (value) {
        addTask(value);
        addInput.value = '';
        addInput.focus();
    }
}

function taskKeypress(event) {
	if (event.which === 13) {
		getValue();
	}
}

function appendLi(task, callback) {
	var wrapper = document.createElement('div');
	wrapper.innerHTML = Mustache.render(taskTemplate, task);
	var li = wrapper.getElementsByTagName('li')[0];
	todo.appendChild(li);

	if (callback) {
		callback();
	}
}

function eventHelperPost(className, clickFunction) {
	var button = todo.lastChild.getElementsByClassName(className)[0];
	button.addEventListener('click', clickFunction);
}

function addTask(text) {
    var newTask = {
    	task: text
    };

    postRequest(newTask, function(result) {
    	appendLi(newTask, function() {
    		var length = todo.childNodes.length;
	    	var parentLi = todo.getElementsByTagName('li')[length - 1];
	    	parentLi.setAttribute('data-id', result);

	    	eventHelperPost('edit-btn', editTask);
	    	eventHelperPost('cancel-btn', cancelEdit);
	    	eventHelperPost('save-btn', saveEdit);
	    	eventHelperPost('del-btn', deleteTask);
    	});
    });
}

function deleteTask() {
    var li = this.closest('li');
    var taskId = li.getAttribute('data-id');
    
    todo.removeChild(li);
    deleteRequest(taskId);
}

function editTask() {
	var li = this.closest('li');
	var spanText = li.querySelector('span.task').innerHTML;
	li.querySelector('input.task').value = spanText;

	if (li.classList) {
		li.classList.add('edit');
	} else {
		li.className += ' ' + 'edit';
	}
	var input = li.getElementsByTagName('input')[0];
	input.select();
	var taskId = li.getAttribute('data-id');

	input.addEventListener('keypress', function(event) {
		if (event.which === 13 && input.value) {
			var updateTask = {
				task: input.value
			};
			putRequest(updateTask, taskId, function(result) {
				li.querySelector('span.task').innerHTML = input.value;
				removeEditClass(li);
			});
		}
	});
}

function removeEditClass(el) {
	if (el.classList) {
		el.classList.remove('edit');
	} else {
		el.className = el.className.replace(new RegExp('(^|\\b)' + 
					   className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
	}
}

function cancelEdit() {
	var li = this.closest('li');
	removeEditClass(li);
}

function saveEdit() {
	var li = this.closest('li');
	var value = li.querySelector('input.task').value;
	var taskId = li.getAttribute('data-id');

	if (value) {
		var updateTask = {
    		task: value
    	};

	    putRequest(updateTask, taskId, function(result) {
	    	li.querySelector('span.task').innerHTML = value;
	    	removeEditClass(li);
	    });
	}
}

function eventHelperGet(className, clickFunction, index) {
	var button = todo.getElementsByClassName(className)[index];
	button.addEventListener('click', clickFunction);
}

function getRequest() {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    var array = JSON.parse(request.responseText);

	    for (var i = 0; i < array.length; i++) {
	    	appendLi(array[i], function() {
	    		eventHelperGet('edit-btn', editTask, i);
	    		eventHelperGet('cancel-btn', cancelEdit, i);
	    		eventHelperGet('save-btn', saveEdit, i);
	    		eventHelperGet('del-btn', deleteTask, i);
	    	})
	    }

	  } else {
	    console.log('Reached target server, but it returned an error');
	  }
	};
	request.onerror = function() {
	  console.log('There was a connection error');
	};

	request.send();
}
getRequest();

function postRequest(newTask, callback) {
	var request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.setRequestHeader('Content-Type', 'application/json');
	
	request.onreadystatechange = function() {
		if (request.status >= 200 && request.readyState == 4) {
			var response = JSON.parse(request.responseText);
			id = response.id;
			callback(id);
		}
	};

	request.send(JSON.stringify(newTask));

	request.onerror = function() {
	  console.log('There was a connection error');
	};
}

function deleteRequest(taskId) {
	var request = new XMLHttpRequest();
	request.open('DELETE', url + '/' + taskId, true);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	
	request.send();

	request.onerror = function() {
		console.log('There was a connection error');
	}
}

function putRequest(updateTask, taskId, callback) {
	var request = new XMLHttpRequest();
	request.open('PUT', url + '/' + taskId, true);
	request.setRequestHeader('Content-Type', 'application/json');

	request.onreadystatechange = function() {
		if (request.status >= 200 && request.readyState == 4) {
			callback();
		}
	};

	request.send(JSON.stringify(updateTask));

	request.onerror = function() {
		console.log('There was a connection error');
	}
}