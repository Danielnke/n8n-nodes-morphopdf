import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class MorphoPdfApi implements ICredentialType {
  name = 'morphoPdfApi';
  displayName = 'MorphoPDF API';
  documentationUrl = 'https://docs.morphopdf.com/api';
  icon = 'file:../nodes/MorphoPdf/morphopdf.svg' as const;

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your MorphoPDF API key (starts with pk_)',
      placeholder: 'pk_xxxxxxxxxxxxxxxxxxxxxxxx',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials?.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.morphopdf.com/v1',
      url: '/rate-limit-status',
      method: 'GET',
    },
  };
}
