declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module '*.svg' {
  import Vue from 'vue'
  export default Vue
}

declare module '*.png' {
  const content: string
  export default content
}

declare module 'superagent/superagent' {
  import request from 'superagent'
  export = request
}
