import ApiRequestError from "~/composables/scripts/api/ApiRequestError";

export default function showApiErrorToast(error: any) {
  const toast = useToast();
  const apiError = ApiRequestError.createFromAny(error);

  toast.add({
    title: apiError.code,
    description: apiError.message,
    color: 'error',
  });
}
