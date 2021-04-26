# Extract Transform Load Universe - ETLU

 ETLU is a Virtual Reality data conversion application used to visual data models and data values and expedite the one-time migration of data from a source system to a target system.

 ## Main Features

* Run locally or deploy to the Cloud


* Web Interface
 * Manage projects
 * Configure connections
    * CSV File
    * Excel File
    * OpenAPI REST Service
    * WSDL SOAP Service
    * GraphQL Service
 * Define custom transformations and validations


* VR Interface
  * Explore and invoke service operations
  * Schema and data model visualization and conversion
    * Map service data to target store schema
    * Map source schema to target transform schema
    * Map source schema to service target schema
  * Store
    * Cached data
    * Schema aware
    * Referenced as a Source, Target, or both
    * Staging source for reports, validations, and loads
  * Job Management
   * Extract
   * Transform
   * Load
   * Difference Detection
   * Multi-stage support for parallel jobs
   * Job Status
   * Validation
   * Reporting



Note ETLU is intended to be used for one time data loads across one or more environments. Other ESB patforms provide more robust support


## Execution

run `java -jar etlu-server-1.0-SNAPSHOT-runner.jar`

Access the application [http://localhost:8080/](http://localhost:8080/)

## Build Instructions

Apache Ignite only supports LTS releases. JDK 15 is currently unsupported but JDK 14 works.

run `mvn clean install`

### Quarkus Development

Start the Quarkus server in development mode by running `mvn quarkus:dev`

Access the application [http://localhost:8080/](http://localhost:8080/)

### Quarkus Development

From the server directory Start the Quarkus server in development mode by running `mvn quarkus:dev`

### Webpack Development

From the xr-server directory start the Quarkus server in development mode by running `mvn quarkus:dev -Dquarkus.http.port=5000`

In the web directory install all dependencies and start the Webpack development server

```
cd target/dev-server
yarn install
yarn start
```

Access the application [http://localhost:8080/](http://localhost:8080/)

## GraphQL

While Quarkus is running in development mode access GraphiQL [http://localhost:8080/graphql-ui](http://localhost:8080/graphql-ui) and run a query like:

```
query allProjects($nextToken: String) {
  projects(limit: 5, nextToken: $nextToken) {    
    projects {
      name
    },
    nextToken
  }
}
```

## Technologies

* [Babylon.js](https://www.babylonjs.com/) - WebXR implementation
* [ECSY](https://ecsy.io/) - scene management framework
* [LitElement](https://lit-element.polymer-project.org/) - Web Component UI framework
* [Quarkus](https://quarkus.io/) - Java Microservices platform
* [Ignite](https://ignite.apache.org/) - In-Memory Grid Computing platform
* [Avro](https://avro.apache.org/) - Language independent typing and serialization library
