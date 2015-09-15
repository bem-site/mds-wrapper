mds-wrapper
===============

[![NPM version](http://img.shields.io/npm/v/mds-wrapper.svg?style=flat)](http://www.npmjs.org/package/mds-wrapper)
[![Coveralls branch](https://img.shields.io/coveralls/bem-site/mds-wrapper/master.svg)](https://coveralls.io/r/bem-site/mds-wrapper?branch=master)
[![Travis](https://img.shields.io/travis/bem-site/mds-wrapper.svg)](https://travis-ci.org/bem-site/mds-wrapper)
[![David](https://img.shields.io/david/bem-site/mds-wrapper.svg)](https://david-dm.org/bem-site/mds-wrapper)
[![David](https://img.shields.io/david/dev/bem-site/mds-wrapper.svg)](https://david-dm.org/bem-site/mds-wrapper#info=devDependencies)

Модуль для работы с медиа-хранилищем.

<!-- TOC -->
- [Использование](#Использование)
- [API](#api)
  - [constructor](#constructor)
  - [read](#read)
  - [write](#write)
  - [remove](#remove)
  - [readToStream](#readtostream)
  - [writeFromStream](#writefromstream)
  - [getFullUrl](#getfullurl)
- [Тестирование](#Тестирование)
- [Лицензия](#Лицензия)

<!-- TOC END -->

### Использование

```
var MDS = require('mds-wrapper'),
    mds = new MDS({
        namespace: 'my-site',
        get: {
            host: '127.0.0.1',
            port: 3000
        },
        post: {
            host: '127.0.0.1',
            port: 3001
        },
        auth: 'your authorization secret token'
    });

mds.read('key1', function(err, data) {
    console.log(data); //your value will be here
});
```

### API

#### constructor

Для инициализации хранилища необходимо создать новый объект класса MDS.
В качестве аргумента конструктор MDS принимает объект с конфигурацией хранилища.

```
mds = new MDS(options);
```

Где объект options может иметь следующий набор доступных полей:

* `namespace` - пространство имен вашего приложения
* `get` - объект с полями `host` и `port`. Соответственно хост и порт медийного хранилища для запросов для чтения данных.
* `post` - объект с полями `host` и `port`. Соответственно хост и порт медийного хранилища для запросов для изменения данных.
* `auth` - заголовок с параметрами авторизации. Необходим для выполнения запросов для изменения данных.
* `timeout` - максимальное время выполнения запроса к хранилищу в миллисекундах. По умолчанию равно 5000.
* `debug` - параметр отладки. Если значение этого параметра равно `true`,
то в консоль будут выводиться детальные сообщения для каждого обращения к хранилищу. По умолчанию `debug` равно `false`.

Примечание 1:

Если хосты для чтения и изменения данных совпадают, то можно использовать более сокращенный,
но устаревший формат конфигурации:

```
var mds = new MDS({
    namespace: 'my-site',
    host: '127.0.0.1',
    get: { port: 3000 },
    post: { port: 3001 },
    auth: 'your authorization secret token'
});
```

Примечание 2:

По умолчанию:
* хост для чтения данных - 127.0.0.1
* порт для чтения данных - 80
* хост для изменения данных - 127.0.0.1
* порт для изменения данных 1111

#### read

Метод для чтения данных из хранилища по ключу.

Параметры:

* {String} `key` - ключ для записи в хранилище.
* {Function} `callback` - функция, которая первым аргументом принимает экземпляр класса Error 
(в случае возникновения ошибки), а вторым - возвращаемые методом данные.

`callback`-функция является опциональным параметром. Без передачи данной функции, метод вернет Promise-объект.

Пример:
```js
mds.read('your-custom-key', function(error, value) {
    console.log(value);
});
mds.read('your-custom-key').then(function(value) {
    console.log(value);
});
```

#### write

Метод для записи данных в хранилище по ключу.

Параметры:

* {String} `key` - ключ для записи в хранилище.
* {String} `value` - значение для записи в хранилище.
* {Function} `callback` - функция, которая первым аргументом принимает экземпляр класса Error 
(в случае возникновения ошибки), а вторым - возвращаемые методом данные.

`callback`-функция является опциональным параметром. Без передачи данной функции, метод вернет Promise-объект.

Пример:
```js
mds.write('your-custom-key', 'your-custom-value', function(error, value) {
    console.log(value); // 'your-custom-value'
});
mds.write('your-custom-key', 'your-custom-value').then(function(value) {
    console.log(value); // 'your-custom-value'
});
```

#### remove

Метод для удаления данных из хранилища по ключу.

Параметры:

* {String} `key` - ключ для записи в хранилище.
* {Function} `callback` - функция, которая первым аргументом принимает экземпляр класса Error 
(в случае возникновения ошибки), а вторым - возвращаемые методом данные.

`callback`-функция является опциональным параметром. Без передачи данной функции, метод вернет Promise-объект.

Пример:
```js
mds.remove('your-custom-key', function(error, result) {
    console.log(result); // null
});
mds.removeP('your-custom-key').then(function(result) {
    console.log(result); // null
});
```

#### readToStream

Метод, считывающий данные из хранилища по ключу и вовращающий экземпляр класса Stream.
Позволяет осуществлять потоковое чтение с помощью NodeJS Stream API.

Пример:

```js
mds.read('your-custom-key').pipe(fs.createWriteStream('./your-custom-key.txt'));
```

#### getFullUrl

Позволяет получить полный url для записи в mds по ключу.

### Тестирование

Для запуска процедуры проверки синтаксиса и стиля кода:
```sh
npm run codestyle
```

Для запуска тестов:
```sh
npm test
```

### Лицензия
© 2012 YANDEX LLC. Код лицензирован [Mozilla Public License 2.0](LICENSE.txt).
