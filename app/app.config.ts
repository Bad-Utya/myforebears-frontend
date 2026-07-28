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
    // url: 'http://159.194.202.125:8081/api',
    // url: 'https://rooots.ru/backend',
    url: 'http://localhost:8081/api',
  }
})
