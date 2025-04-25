import { useRouter } from 'next/navigation'
import Select, { Theme } from 'react-select'
import { getFlagEmoji, getCountrySlug } from '../utils/countryHelpers'
import { logger } from '../utils/logger'

interface CountryOption {
  value: string
  label: string
}

interface CountryFilterProps {
  countries: string[]
  selectedCountry?: string
}

export default function CountryFilter({ countries, selectedCountry }: CountryFilterProps) {
  const router = useRouter()

  // Transform countries into options with flag emojis
  const options: CountryOption[] = countries.map(country => ({
    value: getCountrySlug(country),
    label: `${getFlagEmoji(country)} ${country}`
  }))

  const handleCountryChange = (option: CountryOption | null) => {
    if (option) {
      // Log or track the filter usage
      logger.info('Country filter used:', { country: option.value })
      
      // Navigate to the country page
      router.push(`/countries/${option.value}`)
    }
  }

  // Find currently selected option
  const selectedOption = selectedCountry 
    ? options.find(option => option.value === getCountrySlug(selectedCountry))
    : null

  return (
    <div className="w-full max-w-xs">
      <Select<CountryOption>
        value={selectedOption}
        onChange={handleCountryChange}
        options={options}
        isClearable
        placeholder="Search countries..."
        className="text-sm"
        classNamePrefix="country-select"
        theme={(theme: Theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#0EA5E9', // Tailwind sky-500
            primary75: '#38BDF8', // sky-400
            primary50: '#7DD3FC', // sky-300
            primary25: '#BAE6FD', // sky-200
          },
        })}
      />
    </div>
  )
} 