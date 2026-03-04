/**
 * Apify Service
 * Handles communication with Apify API and Instagram Scraper Actor
 */

import { IG_CONFIG } from '../../test/ig.config.js';

/**
 * Start Apify Actor run
 * @param {Array<string>} accountUsernames - Instagram usernames to scrape
 * @returns {Promise<{runId: string, datasetId: string}>}
 */
export async function startApifyRun(accountUsernames) {
  const actorInput = {
    ...IG_CONFIG.APIFY_INPUT,
    directUrls: accountUsernames.map(username => `https://www.instagram.com/${username}`)
  };

  console.log('[APIFY] Input being sent:');
  console.log('[APIFY]   directUrls:', actorInput.directUrls);
  console.log('[APIFY]   resultsLimit:', actorInput.resultsLimit);
  console.log('[APIFY]   Full input:', JSON.stringify(actorInput, null, 2));

  const runUrl = `https://api.apify.com/v2/acts/${IG_CONFIG.ACTOR_ID}/runs?token=${IG_CONFIG.APIFY_TOKEN}`;

  try {
    const response = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actorInput)
    });

    if (response.status !== 201) {
      throw new Error(`Failed to start actor. Status: ${response.status}`);
    }

    const data = await response.json();
    return {
      runId: data.data.id,
      datasetId: data.data.defaultDatasetId
    };
  } catch (error) {
    throw new Error(`Apify startRun error: ${error.message}`);
  }
}

/**
 * Wait for Apify Actor to finish
 * @param {string} runId - Apify run ID
 * @returns {Promise<boolean>}
 */
export async function waitForActorToFinish(runId) {
  const statusUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${IG_CONFIG.APIFY_TOKEN}`;
  let elapsedTime = 0;

  while (elapsedTime < IG_CONFIG.ACTOR_MAX_WAIT_TIME) {
    try {
      const response = await fetch(statusUrl);
      const data = await response.json();
      const status = data.data.status;

      console.log(`[Apify] Status: ${status} (${elapsedTime}s elapsed)`);

      if (status === 'SUCCEEDED') {
        return true;
      } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
        throw new Error(`Actor failed with status: ${status}`);
      }

      await new Promise(resolve => setTimeout(resolve, IG_CONFIG.ACTOR_CHECK_INTERVAL * 1000));
      elapsedTime += IG_CONFIG.ACTOR_CHECK_INTERVAL;
    } catch (error) {
      throw new Error(`Apify waitForActor error: ${error.message}`);
    }
  }

  throw new Error('Actor timeout');
}

/**
 * Fetch data from Apify dataset
 * @param {string} datasetId - Apify dataset ID
 * @returns {Promise<Array>}
 */
export async function fetchApifyData(datasetId) {
  const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${IG_CONFIG.APIFY_TOKEN}&format=json`;

  try {
    const response = await fetch(datasetUrl);
    const data = await response.json();

    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid data format from Apify');
    }

    console.log(`[Apify] Fetched ${data.length} items from dataset`);
    return data;
  } catch (error) {
    throw new Error(`Apify fetchData error: ${error.message}`);
  }
}
