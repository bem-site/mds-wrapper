mds-wrapper
===============

[![NPM](https://nodei.co/npm/mds-wrapper.png)](https://nodei.co/npm/mds-wrapper/)

[![Coveralls branch](https://img.shields.io/coveralls/bem-site/mds-wrapper/master.svg)](https://coveralls.io/r/bem-site/mds-wrapper?branch=master)
[![Travis](https://img.shields.io/travis/bem-site/mds-wrapper.svg)](https://travis-ci.org/bem-site/mds-wrapper)
[![David](https://img.shields.io/david/bem-site/mds-wrapper.svg)](https://david-dm.org/bem-site/mds-wrapper)
[![David](https://img.shields.io/david/dev/bem-site/mds-wrapper.svg)](https://david-dm.org/bem-site/mds-wrapper#info=devDependencies)

Модуль для работы с медиа-хранилищем.

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

```
mds.read('you-custom-key', function(error, value) {
    console.log(value);
});
```

#### write

Метод для записи данных в хранилище по ключу.

```
mds.write('you-custom-key', 'your-custom-value', function(error, value) {
    console.log(value); // 'your-custom-value'
});
```

#### remove

Метод для удаления данных из хранилища по ключу.

```
mds.remove('you-custom-key', function(error, result) {
    console.log(result); // null
});
```

#### readP

Promise вариант вызова метода `read`:

```
mds.readP('you-custom-key').then(function(value) {
    console.log(value);
});
```

#### writeP

Promise вариант вызова метода `write`:

```
mds.writeP('you-custom-key', 'your-custom-value').then(function(value) {
    console.log(value); // 'your-custom-value'
});
```

#### removeP

Promise вариант вызова метода `remove`:

```
mds.removeP('you-custom-key').then(function(result) {
    console.log(result); // null
});
```

#### getFullUrl

Позволяет получить полный url для записи в mds по ключу.

### Тестирование

Для запуска тестов с дополнительной проверкой синтакса:
```
npm test
```

Для запуска только mocha тестов:
```
npm run mocha
```

Для запуска тестов с покрытием:
```
npm run istanbul
```

### Лицензия
© 2012 YANDEX LLC. Код лицензирован [Mozilla Public License 2.0](LICENSE.txt).
