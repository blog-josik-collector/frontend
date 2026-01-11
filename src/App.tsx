import React from 'react';

import { Button } from './components/ui/button';

const App: React.FC = () => {
  return (
    <div className="flex flex-col flex-wrap justify-center">
      <div className="flex w-full justify-center">
        <Button>Click me</Button>
      </div>
      <div className="flex w-full justify-center">
        <div className="max-w-50 flex-2 justify-center">Content</div>
        <div className="flex-auto justify-center">Content</div>
        <div className="max-w-50 flex-2 justify-center">Content</div>
      </div>
    </div>
  );
};

export default App;
