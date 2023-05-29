import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import components from './components/UI';
import HelperPlugin from './plugins/HelperPlugin'

import MonthPicker from './components/month-picker.vue'
// import Modal from './components/modal.vue'

const app = createApp(App)

app.component(<string>MonthPicker.name, MonthPicker)
// app.component(<string>Modal.name, Modal)

// components.forEach(component => {
//     app.component(component.name, component)
// })

app
    .use(store)
    .use(router)
    .use(HelperPlugin)
    .mount('#app')
