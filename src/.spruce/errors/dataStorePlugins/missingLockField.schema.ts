import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const missingLockFieldSchema: SpruceErrors.DataStorePlugins.MissingLockFieldSchema  = {
	id: 'missingLockField',
	namespace: 'DataStorePlugins',
	name: 'Missing lock field',
	    fields: {
	            /** . */
	            'lockFieldName': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(missingLockFieldSchema)

export default missingLockFieldSchema
