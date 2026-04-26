import ApiRequestError from "~/composables/scripts/api/ApiRequestError";

export default function showApiErrorToast(error: any) {
  const toast = useToast();
  const apiError = ApiRequestError.createFromAny(error);

  console.log(error);
  console.log(apiError);

  toast.add({
    title: apiError.code,
    description: apiError.message,
    color: 'error',
  });
}
