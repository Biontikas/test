# ...

***

## Frontend

### Installation

* [Node.js](http://nodejs.org/download/). Node.js comes with a package manager called [npm](http://npmjs.org) for installing NodeJS applications and libraries.


* Gulp

    ```
    npm install gulp -g
    ```


* Install local dependencies (from the project root folder, the dependencies declared in the app/package.json file):

    ```
    cd app
    ```

    ```
    npm install
    ```


* Install Bower local dependencies (from the project root folder, the dependencies declared in the app/bower.json file):

    ```
    cd app
    ```

    ```
    bower install
    ```


### Building

* Production:

    ```
    cd app
    ```

    ```
    gulp
    ```


* Development:

    ```
    cd app
    ```

    ```
    gulp --dev
    ```

## Backend

### Installation

To setup backend, run following commands:

    cd api && make run

See `api/README.rst` for more details.

### API mockups

To make API development easier, new API's can be quickly added using mockups.
All mockups are stored in `mockups` directory. API routes are defined in
`mockups/routes.json` file. Here is example of one route, from this file:

    {
        "pattern": "/ideas/{id}/orders",
        "mockup": "getIdeaOrders.json"
    }

This `mockups/routes.json` entry defines new route `/ideas/{id}/orders`, which
when called returns content of `mockups/getIdeaOrders.json`. `{id}` is a
variable, that can be passed to URL.

Here is example, how to call this mocked up API:

    curl -s -H "X-Requested-With: XMLHttpRequest" http://0.0.0.0:6543/ideas/1/orders

When defining new routes, you can use these parameters:

* *pattern* - URL route pattern as described [Pyramid
  documentation](http://docs.pylonsproject.org/projects/pyramid/en/1.5-branch/narr/urldispatch.html#route-pattern-syntax)

* *context* - permission context name, from `permissions.json` file. Context
  should be just string with a name identifying a resource. Examples: `user` or
  `document`.

* *permission* - permission name that can be used in `permissions.json` file.
  Examples: `add`, `view`.

* *mockup* - Path to JSON file. Content of this file will be returned as
  response for this view. Specified path must be relative to `mockups/`
  directory.

* *method* - HTTP method. Use this property to restrict defined route only to
  specified HTTP method. If not specified, all HTTP methods will be accepted.

* *view* - Dotted python path to real route handler. Currently these handlers
  are defined:

  * `tradeideas.mockups.views.login`

  * `tradeideas.mockups.views.logout`

* *validate* - an object where property names specifies request data type
  (`GET`, `POST` or `items`) and values specifying schema name. Schema by name
  is fetched from `schemas.json` file. `items` means, that both `GET` and
  `POST` are validated. Schemas are defined using [JSON
  schema](http://json-schema.org/).

  Example: `{"validate": {"POST": "login"}}`

Mockup examples can be found in `api/tradeideas/mockups/tests/fixtures/`
folder.
