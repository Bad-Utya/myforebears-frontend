import { ref } from 'vue'
import sendGetVisualisationRequest from "~/services/visualisations/getVisualisation";
import sendListVisualisationsRequest from "~/services/visualisations/listVisualisations";
import type {VisualisationDTO} from "~/services/visualisations/dtos/inner/VisualisationDTO";
import type {ListVisualisationsResponse} from "~/services/visualisations/dtos/responses/ListVisualisationsResponse";
import sendDeleteVisualisationRequest from "~/services/visualisations/deleteVisualisation";
import showApiErrorToast from "~/utils/ui/notifications/showApiErrorToast";

export function useVisualizations(treeId: string) {
  const visualizations = ref<VisualisationDTO[]>([])
  const loading = ref(false)

  const toast = useToast()

  const fetchList = async () => {
    loading.value = true
    try {
      const response = await sendListVisualisationsRequest(treeId)
      if (response.isSuccessful) {
        visualizations.value = response.data?.visualisations ?? []
      }
    } catch (e) {
      console.error('Failed to fetch visualisations:', e)
    } finally {
      loading.value = false
    }
  }

  const deleteVisualisation = async (vis: VisualisationDTO) => {
    try {
      await sendDeleteVisualisationRequest(treeId, vis.id);
      toast.add({title: 'Visualisation deleted', color:'error'});
    } catch (e) {
      showApiErrorToast(e);
    } finally {
      await fetchList();
    }
  }

  const downloadVisualisation = async (vis: VisualisationDTO) => {
    try {
      const blobData = await sendGetVisualisationRequest(treeId, vis.id)

      const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: vis.mime_type })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      link.setAttribute('download', vis.file_name || `tree-${vis.id}.svg`)

      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      showApiErrorToast(e)
    }
  }

  return {
    visualizations,
    loading,
    fetchList,
    downloadVisualisation,
    deleteVisualisation
  }
}
