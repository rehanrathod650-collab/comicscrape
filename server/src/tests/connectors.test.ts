import { describe, it, expect } from 'vitest';
import { GitHubConnector } from '../connectors/github.connector';
import { TelegramConnector } from '../connectors/telegram.connector';

describe('Connectors Suite', () => {
  it('should instantiate GitHub connector with custom user agent and headers', () => {
    const connector = new GitHubConnector('mock_token');
    expect(connector.name).toBe('GitHub Official Connector');
    expect(connector.sourceType).toBe('GITHUB');
  });

  it('should instantiate Telegram connector with default dev channels', () => {
    const connector = new TelegramConnector(undefined, ['PythonResourcesDaily']);
    expect(connector.name).toBe('Telegram Channel Connector');
    expect(connector.sourceType).toBe('TELEGRAM');
  });
});
