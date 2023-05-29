import {Ref, UnwrapRef} from "vue";
import {Error} from "@/models/error";

export default function useErrorHelper() {
  async function getError(e: any, errors: Ref<UnwrapRef<Error[]>>) {
    if (e instanceof Response) {
      const result = await e.json()

      if (typeof (result.errors) != "undefined" && result.errors !== null) {
        let errs = [];

        for (const [key, value] of Object.entries(result.errors)) {
          errs.push({
            property: key,
            message: `${value}` as any
          })
        }

        errors.value = errs
      } else {
        errors.value = [{message: result.message}]
      }
    } else {
      errors.value = [{message: 'Неизвестная ошибка'}]
    }
  }

  return {
    getError
  }
}
