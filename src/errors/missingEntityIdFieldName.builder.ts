import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
	id: 'missingEntityIdFieldName',
	name: 'Missing entity id field name',
	fields: {
		entityIdFieldName: {
			type: 'text',
			isRequired: true,
		},
	},
})
