let sbt = startSbt({
  sh: 'sbt -DdevMode=true',
  watch: ['build.sbt']
});

let compile = sbt.run({
  command: 'compile',
  watch: ['**/*.scala']
});

let generateClasspath = sbt.run({
  name: 'classpaths',
  command: 'writeClasspath'
});

let database = runServer({
  name: 'mysqld',
  httpPort: 3388,
  sh: 'java -cp `cat /tmp/classpath_$organization$.localdb` $organization$.localdb.LocalDB',
}).dependsOn(generateClasspath)

let server = runServer({
  httpPort: 8888,
  sh: 'java -cp `cat /tmp/classpath_$organization$.core` $organization$.$name;format="camel"$.Main',
  env: {
    MYSQL_HOST: 'localhost',
    MYSQL_PORT: '3388',
    MYSQL_DATABASE: 'cuttle_dev',
    MYSQL_USERNAME: 'root',
    MYSQL_PASSWORD: ''
  }
}).dependsOn(compile, generateClasspath, database);

proxy(server, 8080).dependsOn(compile);
