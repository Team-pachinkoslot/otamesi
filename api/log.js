export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      ok: false,
      error: 'Method Not Allowed'
    });
  }

  try {
    const body = req.body ?? {};

    // 単一ログ・複数ログのどちらにも対応
    const logs = Array.isArray(body.logs)
      ? body.logs
      : [body];

    for (const item of logs) {
      const level = String(item?.level || 'info').toLowerCase();
      const event = item?.event || 'UNKNOWN_EVENT';
      const timestamp = item?.timestamp || new Date().toISOString();
      const data = item?.data ?? {};

      const message = {
        timestamp,
        event,
        data
      };

      if (level === 'error') {
        console.error('[PACHINKO_RUNTIME]', JSON.stringify(message));
      } else if (level === 'warn' || level === 'warning') {
        console.warn('[PACHINKO_RUNTIME]', JSON.stringify(message));
      } else {
        console.log('[PACHINKO_RUNTIME]', JSON.stringify(message));
      }
    }

    return res.status(200).json({
      ok: true,
      received: logs.length
    });
  } catch (error) {
    console.error(
      '[PACHINKO_RUNTIME]',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'LOG_API_ERROR',
        data: {
          message: error instanceof Error ? error.message : String(error)
        }
      })
    );

    return res.status(500).json({
      ok: false,
      error: 'Internal Server Error'
    });
  }
}
