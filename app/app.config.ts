export default defineAppConfig({
  ui: {
    colors: {
      primary: 'turquoise',
      secondary: 'mauve',
      neutral: 'carbon',
    },
    checkbox: {
      slots: {
        base: 'rounded-sm ring ring-inset ring-primary/60 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2'
      }
    }
  },
  api: {
    url: '159.194.202.125:8081/api',
    // url: 'http://rooots.ru/api',
    // url: 'http://localhost:8081/api',
  }
})
