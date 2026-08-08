const NIH_API_URL = 'https://api.reporter.nih.gov/v2/projects/search';
const PROJECT_NUMBER = 'F31EY029154';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const nihResponse = await fetch(NIH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        criteria: {
          project_nums: [PROJECT_NUMBER],
        },
        include_fields: [
          'ProjectNum',
          'ProjectTitle',
          'ApplId',
          'FiscalYear',
          'ProjectDetailUrl',
        ],
        offset: 0,
        limit: 10,
      }),
    });

    if (!nihResponse.ok) {
      throw new Error(`NIH RePORTER returned ${nihResponse.status}`);
    }

    const data = await nihResponse.json();
    const searchId = data.meta?.search_id;
    const grants = data.results?.filter((result) =>
      result.project_num?.includes(PROJECT_NUMBER),
    );
    const originalGrant = grants?.find(
      (grant) => grant.project_num === '1F31EY029154-01',
    );

    if (
      !/^[A-Za-z0-9_-]+$/.test(searchId ?? '') ||
      !grants?.length ||
      !originalGrant?.project_detail_url
    ) {
      throw new Error('The requested grant was not found');
    }

    const grantSearchUrl = `https://reporter.nih.gov/search/${searchId}/projects`;

    response.setHeader(
      'Cache-Control',
      'public, s-maxage=7200, stale-while-revalidate=86400',
    );

    return response.status(200).json({
      grantSearchUrl,
      projectDetailUrl: originalGrant.project_detail_url,
      projectNumber: PROJECT_NUMBER,
      resultCount: grants.length,
      fiscalYears: grants.map((grant) => grant.fiscal_year).sort((a, b) => a - b),
      refreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    return response.status(502).json({
      error: 'Unable to refresh the NIH RePORTER grant link',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
