mds-wrapper
===============

[![Coverage Status](https://coveralls.io/repos/bem-site/mds-wrapper/badge.svg?branch=master)](https://coveralls.io/r/bem-site/mds-wrapper?branch=master)
[![Build Status](https://travis-ci.org/bem-site/mds-wrapper.svg?branch=master)](https://travis-ci.org/bem-site/mds-wrapper)
[![Dependency Status](https://david-dm.org/bem-site/mds-wrapper.svg?style=flat)](https://david-dm.org/bem-site/mds-wrapper)
[![devDependency Status](https://david-dm.org/bem-site/mds-wrapper/dev-status.svg?style=flat)](https://david-dm.org/bem-site/mds-wrapper#info=devDependencies)

Модуль для работы с медиа-хранилищем.

### Использование

```
var MDS = require('mds-wrapper'),
    mds = new MDS({
        host: '127.0.0.1',
        namespace: 'my-site',
        get: { port: 3000 },
        post: { port: 3001 },
        auth: ''
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

* `host` - хост медийного хранилища
* `namespace` - пространство имен вашего приложения
* `get` - объект с полем `port`. Порт медийного хранилища для запросов для чтения данных.
* `post` - объект с полем `port`. Порт медийного хранилища для запросов для изменения данных.
* `auth` - заголовок с параметрами авторизации. Необходим для выполнения запросов для изменения данных.

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
mds.read('you-custom-key').then(function(value) {
    console.log(value);
});
```

#### writeP

Promise вариант вызова метода `write`:

```
mds.write('you-custom-key', 'your-custom-value').then(function(value) {
    console.log(value); // 'your-custom-value'
});
```

#### removeP

Promise вариант вызова метода `remove`:

```
mds.remove('you-custom-key').then(function(result) {
    console.log(result); // null
});
```

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
