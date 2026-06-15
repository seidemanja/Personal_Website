const NIH_API_URL = 'https://api.reporter.nih.gov/v2/projects/search';
const PROJECT_NUMBER = '1F31EY029154-01';
const PROJECT_TITLE =
  'Elucidating the role of the lateral intraparietal area in visually-guided choice behavior';

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
    const grant = data.results?.find(
      (result) =>
        result.project_num === PROJECT_NUMBER &&
        result.project_title?.toLowerCase() === PROJECT_TITLE.toLowerCase(),
    );

    if (!grant?.project_detail_url) {
      throw new Error('The requested grant was not found');
    }

    response.setHeader(
      'Cache-Control',
      'public, s-maxage=7200, stale-while-revalidate=86400',
    );

    return response.status(200).json({
      projectDetailUrl: grant.project_detail_url,
      projectNumber: grant.project_num,
      projectTitle: grant.project_title,
      refreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    return response.status(502).json({
      error: 'Unable to refresh the NIH RePORTER grant link',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
