import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
	id: 'expiredLock',
	name: 'Expired lock',
	fields: {
		lockFieldName: {
			type: 'text',
			isRequired: true,
		},
		lockValue: {
			type: 'text',
			isRequired: true,
		},
	},
})
