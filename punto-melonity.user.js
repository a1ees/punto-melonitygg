// ==UserScript==
// @name         melonity punto
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Кастомный пунтосвитчер для вк
// @author       alees
// @match        https://vk.com/gim*
// @icon         none
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
    const rightMenu = document.querySelector('._im_right_menu'); // вк меню справа
    const addTemplateContainer = document.createElement('div'); // контейнер шаблонов
    const openButton = document.createElement('div'); // кнопка открытия контейнера
    const closeButton = document.createElement('div'); // закрывает контейнер
    const registerButton = document.createElement('div'); // открывает регистрацию
    const chatText = document.querySelector('.im-chat-input--text'); // инпут вк чата
    const templateList = document.createElement('div'); // список шаблонов

    let templateListVisible = false; // состояние списка шаблонов

    closeButton.classList.add('template__close_btn')

    templateList.style.height = '260px';
    templateList.style.overflow = 'auto';
    templateList.style.border = '1px solid #fff'
    templateList.style.borderRadius = "3px";
    templateList.style.marginTop = "10px"
    templateList.style.display = templateListVisible ? 'flex' : 'none';
    templateList.style.flexDirection = "column";
    templateList.style.alignItems = "center";
    templateList.style.boxShadow = "0 0 5px 2px rgba(255, 255, 255, 0.2)";
    rightMenu.prepend(templateList);

    registerButton.classList.add('button__template')
    addTemplateContainer.classList.add('ui_rmenu_item', '_im_peer_tab', 'melonity_template');
    addTemplateContainer.style.textAlign = "center";
    rightMenu.prepend(addTemplateContainer); // добавили контейнер в правое меню

    let containerStatus = false; // отслеживает статус контейнера
    let registr = false; // отслеживает статус окна регистрации

    let templateValue; // переменная для отправки шаблона на сервер
    let textValue; // переменная для отправки текста на сервер

    let userLoginAuth; // переменная для отправки логина авторизации на сервер
    let userLoginReg; // переменная для отправки логина регистрации на сервер
    let user = localStorage.getItem('owner');

    let arrTemplate; // хранит шаблоны пользователя
    let currentText; // хранит введенный текст в инпут вк
    const regularProm = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/; // регулярка промокода
    const regularPromHello = /^п[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/ // проверка начала строки с п для приветствия

    const addTemlate = (arr) => { // добавляет шаблоны в список шаблонов
      if(templateList) {
        templateList.textContent = ''
      }
      arr.forEach((item) => {
        const deleteButton = document.createElement('div');
        deleteButton.style.position = "absolute";
        deleteButton.style.top = "5px";
        deleteButton.style.right = "5px";
        deleteButton.style.cursor = "pointer";
        deleteButton.textContent = "✖";
        deleteButton.addEventListener('click', function () {
          deleteTemplate(item._id, user);
        });

        const templateListItem = document.createElement('div');
        templateListItem.style.width = "255px"
        templateListItem.style.height = "60px"
        templateListItem.style.marginTop = "5px"
        templateListItem.style.backgroundColor = "#505253"
        templateListItem.style.borderRadius = "1px"
        templateListItem.style.borderRadius = "5px"
        templateListItem.style.whiteSpace = 'pre-wrap';
        templateListItem.style.padding = "5px"
        templateListItem.style.position = "relative";
        const textContent = item.text.length > 56
      ? `${item.text.slice(0, 56)}...`
      : item.text;
        templateListItem.textContent = `${item.templates}\n`

        const textContentElement = document.createElement('span');
        textContentElement.textContent = textContent;
        textContentElement.style.whiteSpace = 'normal';
        textContentElement.style.color = "#8ab6d9"
        templateListItem.appendChild(textContentElement);
        templateListItem.appendChild(deleteButton);
        templateList.appendChild(templateListItem);
      })
    }

    chatText.addEventListener('input', function(event) { // пунто
      getTemplate(user)
      handleInputChatText(event)
      arrTemplate.forEach((item) => {
        if(item.templates === currentText) {
          chatText.innerHTML = item.text.replace(/\n/g, '<br>');
          setCursorPosition(chatText);
        } else if("п" + item.templates === currentText) {
          chatText.innerHTML = 'Приветствую.<br>' + item.text.replace(/\n/g, '<br>');
          setCursorPosition(chatText);
        } else if(regularProm.test(currentText)) {
          chatText.innerHTML = `Ваш ключ: ${currentText}<br>Приятной игры :)`
          setCursorPosition(chatText);
        } else if(regularPromHello.test(currentText)) {
          chatText.innerHTML = `Приветствую.<br>Ваш ключ: ${currentText}<br>Приятной игры :)`
          setCursorPosition(chatText);
        }
      })
    })

    function setCursorPosition(element) { //при вставке шаблона курсор переносится в конец текста
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function handleInputChatText(event) { // отслеживает инпут в тексте вк
      const inputElement = event.target;
      const value = inputElement.textContent;
      currentText = value
    }

    function handleInputTemplateChange(event) { // отслеживает инпут в шаблоне
      const inputElement = event.target;
      const value = inputElement.value;
      templateValue = value;
    }

    function handleInputTextChange(event) { // отслеживает инпут в тексте
      const inputElement = event.target;
      const value = inputElement.value;
      textValue = value
    }

    function handleInputLoginAuth(event) { // отслеживает инпут в логине
      const inputElement = event.target;
      const value = inputElement.value;
      userLoginAuth = value
    }

    function handleInputLoginReg(event) { // отслеживает инпут в регистрации
      const inputElement = event.target;
      const value = inputElement.value;
      userLoginReg = value
    }

    const createInputTemplate = () => { // генерит инпуты создания шаблонов
      let acc;
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Шаблон'
      input.addEventListener('input', handleInputTemplateChange);
      input.style.marginBottom = "5px"
      input.classList.add('input__template');
      acc += addTemplateContainer.append(input);

      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Текст';
      textarea.addEventListener('input', handleInputTextChange);
      textarea.classList.add('textarea__template');
      textarea.style.width = "144px";
      textarea.style.height = "63px";
      acc += addTemplateContainer.append(textarea);

      const button = document.createElement('button'); // кнопка при клике генерит темплейт
      button.textContent = 'Добавить шаблон';
      button.style.marginTop = '10px';
      button.style.width = '130px';
      button.style.height = '20px';
      button.style.backgroundColor = '#007BFF';
      button.style.color = '#fff';
      button.style.border = 'none';
      button.style.borderRadius = '5px';
      button.style.fontSize = '12px';
      button.style.textAlign = 'center';
      button.style.lineHeight = '20px';
      button.style.cursor = 'pointer';
      button.addEventListener('click', function() {
        createTemplate(templateValue, textValue, user);
      });
      button.classList.add('button__template');
      acc += addTemplateContainer.append(button)

      const buttonTemplateList = document.createElement('button'); // кнопка при клике генерит список шаблонов
      buttonTemplateList.textContent = templateListVisible ? 'Скрыть список' : 'Список шаблонов';
      buttonTemplateList.style.marginTop = '10px';
      buttonTemplateList.style.width = '130px';
      buttonTemplateList.style.height = '20px';
      buttonTemplateList.style.backgroundColor = '#007BFF';
      buttonTemplateList.style.color = '#fff';
      buttonTemplateList.style.border = 'none';
      buttonTemplateList.style.borderRadius = '5px';
      buttonTemplateList.style.fontSize = '12px';
      buttonTemplateList.style.textAlign = 'center';
      buttonTemplateList.style.lineHeight = '20px';
      buttonTemplateList.style.cursor = 'pointer';
      buttonTemplateList.addEventListener('click', function() {
        getTemplate(user)
        templateListVisible = !templateListVisible;
        templateList.style.display = templateListVisible ? 'flex' : 'none';

        if (templateListVisible) {
          buttonTemplateList.textContent = 'Скрыть список';
        } else {
          buttonTemplateList.textContent = 'Список шаблонов';
        }
      });
      buttonTemplateList.classList.add('button__template_list');
      acc += addTemplateContainer.append(buttonTemplateList)
      return acc;
    }

    const createInputAuth = () => { // генерит инпут авторизации
      let acc;
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Логин'
      input.addEventListener('input', handleInputLoginAuth);
      input.classList.add('input__template');
      acc += addTemplateContainer.append(input);

      const button = document.createElement('button'); // кнопка при клике авторизовывает и записывает данные в локал
      button.textContent = 'Авторизоваться';
      button.style.marginTop = '10px';
      button.style.width = '130px';
      button.style.height = '20px';
      button.style.backgroundColor = '#007BFF';
      button.style.color = '#fff';
      button.style.border = 'none';
      button.style.borderRadius = '5px';
      button.style.fontSize = '12px';
      button.style.textAlign = 'center';
      button.style.lineHeight = '20px';
      button.style.cursor = 'pointer';
      button.style.transition = 'background-color 0.3s';
      button.addEventListener('click', function() {
        auth(userLoginAuth)
      });
      button.classList.add('button__template_auth');
      acc += addTemplateContainer.append(button)
    }

    const createInputReg = () => { // генерит инпут регистрации
      let acc;
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Логин'
      input.addEventListener('input', handleInputLoginReg);
      input.classList.add('input__template');
      acc += addTemplateContainer.append(input);

      const button = document.createElement('button'); // кнопка при клике регистрирует пользователя
      button.textContent = 'Зарегистрироваться';
      button.style.marginTop = '10px';
      button.style.width = '130px';
      button.style.height = '20px';
      button.style.backgroundColor = '#007BFF';
      button.style.color = '#fff';
      button.style.border = 'none';
      button.style.borderRadius = '5px';
      button.style.fontSize = '12px';
      button.style.textAlign = 'center';
      button.style.lineHeight = '20px';
      button.style.cursor = 'pointer';
      button.style.transition = 'background-color 0.3s';
      button.addEventListener('click', function() {
        reg(userLoginReg)
      });
      button.classList.add('button__template_reg');
      acc += addTemplateContainer.append(button)
    }

    const removeInputAndButton = () => { // удаляет инпуты и кнопки
      const input = document.querySelector('.input__template');
      const button = document.querySelectorAll('.button__template');
      const buttonAuth = document.querySelector('.button__template_auth');
      const buttonReg = document.querySelector('.button__template_reg');
      const textarea = document.querySelector('.textarea__template');
      const buttonTemplateList = document.querySelector('.button__template_list')
      if(buttonTemplateList) {
        buttonTemplateList.remove();
      }
      if(buttonReg) {
        buttonReg.remove();
      }
      if(input) {
        input.remove();
      }
      if(buttonAuth) {
        buttonAuth.remove()
      }
      if(button) {
        button.forEach((item) => {
          item.remove();
        })
      }
      if(textarea) {
        textarea.remove();
      }
    }

    const closeMenu = () => { // закрывает меню
      addTemplateContainer.append(openButton)
      addTemplateContainer.style.display = "block";
      addTemplateContainer.style.height = "36px";
      openButton.style.width = "150px";
      openButton.style.height = "20px";
      openButton.textContent = "Добавить шаблон";
    }
    closeMenu();

    const openMenu = () => { // открывает меню
      addTemplateContainer.append(closeButton)
      addTemplateContainer.style.display = "flex";
      addTemplateContainer.style.flexDirection = "column";
      addTemplateContainer.style.height = "160px";
      if(!user) {
        addTemplateContainer.append(registerButton)
        registerButton.style.width = "75px";
        registerButton.style.height = "15px";
        registerButton.textContent = "Регистрация"
        registerButton.style.height = '10px';
        registerButton.style.backgroundColor = 'red';
        registerButton.style.color = '#fff';
        registerButton.style.border = 'none';
        registerButton.style.borderRadius = '5px';
        registerButton.style.fontSize = '10px';
        registerButton.style.textAlign = 'center';
        registerButton.style.lineHeight = '10px';
        registerButton.style.cursor = 'pointer';
        registerButton.style.marginBottom = "10px"
        registerButton.addEventListener('click', function() {
          registr = !registr
          removeInputAndButton()
          toggleModal()
        })
      }
      closeButton.style.width = "150px";
      closeButton.style.height = "20px";
      closeButton.style.marginBottom = "10px";
      closeButton.textContent = "Закрыть";
    }

    const toggleModal = () => { // свичит состояние меню
      if(containerStatus && user) {
        openButton.remove();
        openMenu();
        createInputTemplate();
      } else if (containerStatus && !user && !registr) {
        openButton.remove();
        openMenu();
        createInputAuth();
      } else if (containerStatus && !user && registr) {
        createInputReg()
      } else {
        closeButton.remove();
        closeMenu();
        removeInputAndButton();
      }
    }

    openButton.addEventListener('click', () => { // слушаем кнопку "добавить шаблон"
      containerStatus = !containerStatus;
      getTemplate(user);
      toggleModal();
    });
    closeButton.addEventListener('click', () => { // слушаем кнопку "закрыть"
      containerStatus = !containerStatus;
      if(registr) {
        registr = false
      }
      toggleModal();
    });

    const reg = (log) => { // функция регистрации, принимает логин
      const authReg = document.querySelector('.button__template_reg');
      const currentBtnText = authReg.textContent;
      const currentBtnColor = authReg.style.backgroundColor;
      fetch('https://api.a1ees.nomoredomainsrocks.ru/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login: log })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          registr = !registr
          authReg.textContent = 'Пользователь создан!'
          authReg.style.backgroundColor = "green"
          console.log('Регистрация прошла успешно')
          setTimeout(() => {
            removeInputAndButton()
            toggleModal()
          }, 1200);
        })
        .catch(error => {
          authReg.textContent = 'Такой логин уже есть'
          authReg.style.backgroundColor = "red"
          console.error('Fetch error:', error);
        })
        .finally(() => {
          setTimeout(() => {
            authReg.textContent = currentBtnText;
            authReg.style.backgroundColor = currentBtnColor;
          }, 2000);
        })
    }

    const auth = (log) => { // функция авторизации, принимает логин, записывает auth данные в локалсторейдж
      const authBtn = document.querySelector('.button__template_auth');
      const currentBtnText = authBtn.textContent;
      const currentBtnColor = authBtn.style.backgroundColor;
      fetch('https://api.a1ees.nomoredomainsrocks.ru/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login: log })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          user = data._id
          localStorage.setItem("owner", data._id)
          containerStatus = !containerStatus
          authBtn.style.backgroundColor = "green"
          authBtn.textContent = 'Доне'
          setTimeout(() => {
            toggleModal()
          }, 1200);
        })
        .catch(error => {
          authBtn.style.backgroundColor = "#FF0000"
          authBtn.textContent = 'Неверный логин'
          console.error('Fetch error:', error);
        })
        .finally(() => {
          getTemplate(user)
          setTimeout(() => {
            authBtn.textContent = currentBtnText;
            authBtn.style.backgroundColor = currentBtnColor;
          }, 2000);
        })
    }

    const createTemplate = (templates, text, userId) => { // создание шаблона
      const input = document.querySelector('.input__template');
      const textarea = document.querySelector('.textarea__template');
      input.value = '';
      textarea.value = '';
      templateValue = '';
      textValue = '';
      const currentPlaceholder = textarea.placeholder;
      const currentBackgroundColor = textarea.style.backgroundColor;
      fetch('https://api.a1ees.nomoredomainsrocks.ru/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': userId
        },
        body: JSON.stringify({ templates, text, owner: userId })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          textarea.placeholder = 'Шаблон отправлен на сервер!';
          textarea.style.backgroundColor = 'lightgreen';

        })
        .catch(error => {
          textarea.placeholder = 'Ошибка отправки :с';
          textarea.style.backgroundColor = 'red';
          console.error('Fetch error:', error);
        })
        .finally(() => {
          getTemplate(user)
          addTemlate(arrTemplate)
          setTimeout(() => {
            textarea.placeholder = currentPlaceholder;
            textarea.style.backgroundColor = currentBackgroundColor;
          }, 1000);
        })
    }

    const getTemplate = (userId) => { // получение шаблонов с сервера
      fetch('https://api.a1ees.nomoredomainsrocks.ru/templates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'userId': userId
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log(data)
          addTemlate(data)
          arrTemplate = data
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
    }

    const deleteTemplate = (templateId, userId) => { // удаление шаблонов с сервера
      fetch('https://api.a1ees.nomoredomainsrocks.ru/templates', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'userId': userId
        },
        body: JSON.stringify({ templId: templateId })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          getTemplate(userId)
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
    }
})();
