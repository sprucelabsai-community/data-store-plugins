import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const expiredLockSchema: SpruceErrors.DataStorePlugins.ExpiredLockSchema  = {
	id: 'expiredLock',
	namespace: 'DataStorePlugins',
	name: 'Expired lock',
	    fields: {
	            /** . */
	            'lockFieldName': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'lockValue': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(expiredLockSchema)

export default expiredLockSchema
