export default {
    install: (app: any) => {
      app.inArray = function (str: any, arr: any) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == str) {
                return true;
            }
        }
        return false;
      }

      app.provide('inArray', app.inArray)
    }
}
