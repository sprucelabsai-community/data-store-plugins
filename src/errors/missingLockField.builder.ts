import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'missingLockField',
    name: 'Missing lock field',
    fields: {
        lockFieldName: {
            type: 'text',
            isRequired: true,
        },
    },
})
