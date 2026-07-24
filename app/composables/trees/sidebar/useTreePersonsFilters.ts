import type PersonDTO from '~/services/familytree/dtos/inner/PersonDTO'

type GenderFilter = 'BOTH' | 'MALE' | 'FEMALE'

function getBirthYear(person: PersonDTO) {
  return Number(person.birth_event?.date_iso?.slice(0, 4) || '')
}

function getAge(person: PersonDTO) {
  const birthYear = getBirthYear(person)

  if (!Number.isFinite(birthYear)) {
    return undefined
  }

  return new Date().getFullYear() - birthYear
}

function matchesGender(person: PersonDTO, filter: GenderFilter) {
  if (filter === 'BOTH') {
    return true
  }

  if (filter === 'MALE') {
    return person.gender === 'GENDER_MALE'
  }

  return person.gender === 'GENDER_FEMALE'
}

export function useTreePersonsFilters(persons: MaybeRefOrGetter<PersonDTO[]>) {
  const query = ref('')
  const genderFilter = ref<GenderFilter>('BOTH')
  const ageFrom = ref<string>('')
  const ageTo = ref<string>('')
  const yearFrom = ref<string>('')
  const yearTo = ref<string>('')

  const filteredPersons = computed(() => {
    const sourcePersons = toValue(persons)
    const terms = query.value
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    return sourcePersons.filter((person) => {
      const haystack = [
        person.first_name,
        person.last_name,
        person.patronymic,
        [person.first_name, person.last_name].filter(Boolean).join(' ')
      ].filter(Boolean).join(' ').toLowerCase()

      if (terms.length && !terms.every(term => haystack.includes(term))) {
        return false
      }

      if (!matchesGender(person, genderFilter.value)) {
        return false
      }

      const birthYear = getBirthYear(person)
      const age = getAge(person)
      const normalizedYearFrom = Number(yearFrom.value)
      const normalizedYearTo = Number(yearTo.value)
      const normalizedAgeFrom = Number(ageFrom.value)
      const normalizedAgeTo = Number(ageTo.value)

      if (yearFrom.value && (!Number.isFinite(birthYear) || birthYear < normalizedYearFrom)) {
        return false
      }

      if (yearTo.value && (!Number.isFinite(birthYear) || birthYear > normalizedYearTo)) {
        return false
      }

      if (ageFrom.value && (age == null || age < normalizedAgeFrom)) {
        return false
      }

      if (ageTo.value && (age == null || age > normalizedAgeTo)) {
        return false
      }

      return true
    })
  })

  function resetFilters() {
    genderFilter.value = 'BOTH'
    ageFrom.value = ''
    ageTo.value = ''
    yearFrom.value = ''
    yearTo.value = ''
  }

  return {
    query,
    genderFilter,
    ageFrom,
    ageTo,
    yearFrom,
    yearTo,
    filteredPersons,
    resetFilters
  }
}
