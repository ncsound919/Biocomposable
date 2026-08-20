import re

with open('src/components/RecipeBuilder.tsx', 'r') as f:
    text = f.read()

# RecipeStepState and ComponentParameter should be imported from "../types" instead of "../data"

text = text.replace(
"""import {
  componentsList,
  COMPONENT_LAYERS,
  canAddComponent,
  getMissingRequirements,
  validateDAG,
  type RecipeStepState,
  type DAGStatus,
  type ComponentParameter,
} from "../data";""",
"""import {
  componentsList,
  COMPONENT_LAYERS,
  canAddComponent,
  getMissingRequirements,
  validateDAG,
  type DAGStatus,
} from "../data";
import { type RecipeStepState, type ComponentParameter } from "../types";"""
)

# For the key prop error on ParameterInput, ParameterInput takes `key` implicitly since it's a React component, but since it's not typed to include `key` maybe TS is complaining because I didn't type the Props.
# Actually in React 18 / TypeScript, key is intrinsically allowed on function components if it's not destructured. Wait, no, TS shouldn't complain about `key` unless something weird is happening. Let's look at the error:
# "Property 'key' does not exist on type '{ param: ComponentParameter; value: string | number | boolean; onChange: (value: string | number | boolean) => void; }'."

# Let's just fix it by adding key?: string to the parameter type or React.FC
text = text.replace("""function ParameterInput({
  param,
  value,
  onChange,
}: {""", """function ParameterInput({
  param,
  value,
  onChange,
}: {
  key?: React.Key;""")

with open('src/components/RecipeBuilder.tsx', 'w') as f:
    f.write(text)
