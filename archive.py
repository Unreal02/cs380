import os
import sys
import zipfile

top_exceptions = {'node_modules', 'pics', 'supplementary_materials', '.git', '.idea'}

def main(student_id):
  output_name = 'cs380_{}.zip'.format(student_id)
  with zipfile.ZipFile(output_name, 'w', zipfile.ZIP_DEFLATED) as output:
    for top_file in os.listdir():
      if top_file in top_exceptions:
        continue
      if not os.path.isdir(top_file) and top_file != output_name:
        output.write(os.path.join('.', top_file))
      else:
        for root, dirs, files in os.walk(os.path.join('.', top_file)):
          for file in files:
            if file != output_name:
              output.write(os.path.join(root, file))

  print('zip output :', output_name)

if __name__ == '__main__':
  if len(sys.argv) != 2:
    print('Usage : archive.py [student ID]')
    print('Example : python archive.py 20221234')
    sys.exit(1)
  
  main(sys.argv[1])
