import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'missingPeriodIdFieldName',
    name: 'Missing period id field name',
    fields: {
        periodIdFieldName: {
            type: 'text',
            isRequired: true,
        },
    },
})
