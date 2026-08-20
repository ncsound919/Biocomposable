import os
import re

with open('src/components/ClinicalFlywheel.tsx', 'r') as f:
    text = f.read()

# Fix the closing tag for the 6-step loop card
text = text.replace(
    '              </div>\n            </div>\n          );\n        })}\n      </motion.div>',
    '              </div>\n            </motion.div>\n          );\n        })}\n      </motion.div>'
)

# Fix the closing tag for the advanced capabilities card
text = text.replace(
    '              </div>\n            </div>\n          ))}\n        </motion.div>',
    '              </div>\n            </motion.div>\n          ))}\n        </motion.div>'
)


with open('src/components/ClinicalFlywheel.tsx', 'w') as f:
    f.write(text)

