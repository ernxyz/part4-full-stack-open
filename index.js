const { log } = require('./utils/logger')
const { PORT } = require('./utils/config')
const app = require('./app')

app.listen(PORT, () => {
  log('server listening on port', PORT);
})