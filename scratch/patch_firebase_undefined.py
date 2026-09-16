import sys

file_path = r'C:\Users\cassi\.gemini\antigravity\scratch\agenda-digital\src\context\AppDataContext.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_add_doc = """  const addDocument = async (colName, data) => {
    try {
      const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      const docRef = await addDoc(collection(db, colName), cleanData);
      return docRef.id;
    } catch (e) {
      console.error(`Error adding document to ${colName}:`, e);
      return null;
    }
  };"""

old_add_doc = """  const addDocument = async (colName, data) => {
    try {
      const docRef = await addDoc(collection(db, colName), data);
      return docRef.id;
    } catch (e) {
      console.error(`Error adding document to ${colName}:`, e);
      return null;
    }
  };"""

new_update_doc = """  const updateDocument = async (colName, id, data) => {
    try {
      const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      await updateDoc(doc(db, colName, id), cleanData);
    } catch (e) {
      console.error(`Error updating document in ${colName}:`, e);
    }
  };"""

old_update_doc = """  const updateDocument = async (colName, id, data) => {
    try {
      await updateDoc(doc(db, colName, id), data);
    } catch (e) {
      console.error(`Error updating document in ${colName}:`, e);
    }
  };"""

content = content.replace(old_add_doc, new_add_doc)
content = content.replace(old_update_doc, new_update_doc)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added cleanData to Firebase methods!")
