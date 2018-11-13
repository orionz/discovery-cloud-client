
# Client or Discovery Cloud Server

A simple discovery cloud client library that can be paired with the [discovery-cloud-server](https://github.com/orionz/discovery-cloud-server) to be used as a cloud based alternative to [discovery-swarm](https://github.com/mafintosh/discovery-swarm)

### Example

```ts
  import { Repo } from "hypermerge"

  import Client from "discovery-cloud-client"

  const ram: Function = require("random-access-memory")

  const repo = new Repo({ storage: ram })

  const discovery = new Client({
    url: "wss://fish-monger-9999.herokuapp.com",
    id: repo.id,
    stream: repo.stream,
  })

  repo.replicate(discovery)
```

### License 

MIT
