import type PersonDTO from "~/services/familytree/dtos/inner/PersonDTO";
import sendExportGedcomRequest from "~/services/familytree/exportGedcom";
import sendCreateFullVisualisationRequest from "~/services/visualisations/createFullVisualisation";
import sendCreateAncestorsVisualisationRequest from "~/services/visualisations/createAncestorsVisualisation";
import sendCreateDescendantsVisualisationRequest from "~/services/visualisations/createDescendantsVisualisation";
import sendCreateAncestorsDescendantsVisualisationRequest from "~/services/visualisations/createAncestorsDescendantsVisualisation";

export const useTreeExport = (treeId: string, persons: Ref<PersonDTO[]>) => {
  const pending = ref(false)
  const toast = useToast()

  const rootPersonId = ref<string | undefined>(undefined)
  const excludedPersonIds = ref<string[]>([])

  const allPersonIds = computed(() => personOptions.value.map(p => p.value))
  const includedPersonIds = computed(() => {
    return allPersonIds.value.filter(id => !excludedPersonIds.value.includes(id))
  })

  const svgTypes = [
    { id: 'full', label: 'Full Tree', description: 'All connected relatives' },
    { id: 'ancestors', label: 'Ancestors', description: 'Direct bloodline up' },
    { id: 'descendants', label: 'Descendants', description: 'Direct bloodline down' },
    { id: 'both', label: 'Ancestors & Descendants', description: 'Both directions from root' }
  ]
  const selectedType = ref(svgTypes[0])

  const tabs = [
    { label: 'GED', icon: 'i-lucide-file-text', slot: 'gedcom' },
    { label: 'SVG', icon: 'i-lucide-image', slot: 'svg' }
  ]

  const personOptions = computed(() => persons.value.map(p => ({
    value: p.person_id || p.id || '',
    label: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown'
  })))

  const downloadGedcom = async () => {
    pending.value = true
    try {
      const content = await sendExportGedcomRequest(treeId)
      const blob = new Blob([content], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `tree_${treeId}.ged`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      toast.add({ title: 'Export failed', color: 'error' })
    } finally {
      pending.value = false
    }
  }

  const exportVisualisation = async () => {
    pending.value = true
    const type = selectedType.value?.id
    const rootId = rootPersonId.value
    const includedPersons = includedPersonIds.value

    try {
      switch (type) {
        case 'full': await sendCreateFullVisualisationRequest(treeId, rootId, includedPersons); break
        case 'ancestors': await sendCreateAncestorsVisualisationRequest(treeId, rootId, includedPersons); break
        case 'descendants': await sendCreateDescendantsVisualisationRequest(treeId, rootId, includedPersons); break
        case 'both': await sendCreateAncestorsDescendantsVisualisationRequest(treeId, rootId, includedPersons); break
      }
      toast.add({ title: 'Visualization added', color: 'primary' })
    } catch (e) {
      toast.add({ title: 'Visualisation failed', color: 'error' })
    } finally {
      pending.value = false
    }
  }

  return {
    pending,
    rootPersonId,
    excludedPersonIds,
    selectedType,
    tabs,
    svgTypes,
    personOptions,
    downloadGedcom,
    exportVisualisation
  }
}
