// ============================================================
// Country display names
// ============================================================

const regionNames = new Intl.DisplayNames(
  ['en-GB'],
  {
    type: 'region'
  }
);


// ============================================================
// Format country
// ============================================================

function getCountryName(countryName, countryCode) {
  // Use an existing readable country name when available.
  if (
    countryName &&
    countryName.length > 2
  ) {
    return countryName;
  }

  const code =
    countryCode ||
    countryName;

  if (!code) {
    return 'Unknown Country';
  }

  try {
    const formattedName =
      regionNames.of(
        code.toUpperCase()
      );

    return formattedName || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}


// ============================================================
// Exports
// ============================================================

export {
  getCountryName
};