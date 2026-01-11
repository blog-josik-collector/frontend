import React from 'react';

import { Button } from './components/ui/button';

const App: React.FC = () => {
  return (
    <div className="flex flex-col flex-wrap justify-center">
      <div className="flex h-15 w-full items-center justify-center">
        <Button>Click me</Button>
      </div>
      <div className="flex h-full justify-center">
        <div className="max-w-50 flex-2 justify-center"></div>
        <div className="flex-auto justify-center">
          <div>필터</div>
          <div>테이블</div>
          <div>페이지</div>
        </div>
        <div className="max-w-50 flex-2 justify-center"></div>
      </div>
    </div>
  );
};

export default App;
