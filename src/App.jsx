import { useState, useEffect, useCallback, useRef } from "react";
import { DB, supabase, newId } from "./db.js";
import { resolveCamera, ZONE_NAMES, ROOM_NUMBERS, PIANI } from "./zoneData.js";
import NotificheSettings, { playNotifSound } from "./NotificheSettings";

const HOTEL_LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAHLCAMAAABF4lV9AAAAflBMVEX///8AAACUlJRGRkZ/f39AQEAPDw/t7e3V1dWNjY0JCQmcnJxJSUmoqKjf399vb28qKirz8/PJyckUFBTm5ua9vb2ysrI2NjZ8fHx1dXUaGhqurq49PT0xMTFISEj4+PhTU1PGxsYeHh5SUlJlZWWQkJAkJCRnZ2dcXFyhoaEUbHSvAAAXQUlEQVR4nO2d54KqOhCAwQqoWLCXFcu6+P4veEhoEyCYgVjO7nw/7vWoIHybMgkphkEQBEEQBEEQBEEQBPF0ZvdxhwCM7zOprFbbJATaLZKlDMlCQLIQkCwEJAsByUJAshCQLAQkCwHJQkCyEJAsBCQLAclCQLIQkCwEJAsByUJAshCQLAQkCwHJQkCyEJAsBCQLAclCQLIQkCwEJAsByUJAshCQLAQkCwHJQkCyEJAsBL9M1q3bvT3v7G+S1XFdW3hjZLlXDecN72ak4TQS3iRrZBgL4Q3XMDoazkuyEJCsGOfUdycPvkOyYpy+YawefIdkxdwMkhWhIOs7vCbKhoycrIO9tKwFuILDZsmuyQ7GnX365q3DvmUfsuP+oKzzIrkG9yt+q5NdVxKgOYPknYWXHPn3ZF3gVcRqirLOLvvH8cj+O00S15+TxV2drqvV5Z65uSwGo9DLonU/BfyNHnM1mHjezQ5f9LfRsb9XltNLMJ1M1nYa/nYkxJzMw9d+fAwLHbJLYiK78bemqaLfKus47wOMVBYriS7J987hB278mslKijBznxmN0mJU7P9WWQUiWecws7WyL16zpCXIagn5eJHk1j8mKzDEaCrMn4PolSArfBv0UoTF/4y/+K2yZrfDKmFymCey7OS+Y+7pv6EsFs2fRsuYkWUYc4e9/1tlSWrD/CedtNCCstqFqyVZpkzWV3h90/40wzjx9/+YrFYuG4aVoxW9grImBmtUe4BecvRfksWqP1jAh8XRPXoFZbHXvlnkj8liaQZ0z/tGGk8JQWl4gmXJef+YLJP1LqQdCyyyj4ruXGoaGjBpLWdxYvxrsg6s7I47+Ty2Us5P8p1TmiNNHoceE6cs6I+a0n9NljlmPz5qn7crmzUTMz+s52EwmUQPBreshTQ4OGZvyIzuoq/8OVnmGl4FuHevz9+Jy6oDM2n03SN47w/KMtvz5BqOP/BLK+4nOdBLuwiNTfKNwW+U9bNYboQ37N3iAv4ZLMMUM19seuJhvfViZo3Tf64Gs/nUXYyzbwWLxY/5ND53rIO3VfmW4zz7OgCfK+sDIVkISBYCkoWAZCEgWQhIFgKShYBkISBZCEgWApKFgGQhIFkISBYCkoWAZCEgWQhIFgKShYBkISBZCEgWApKFgGQhIFkISBYCkoXgo2X19pfL8NHk1Vp8+UMJfld+1OfK6o1PfJya0d8NdZ/bO0rv2jjJD/tYWWt4P67mS+n15bLKBkHHfKism5u7mIHe88u3wARjWAt8pqx98WpOWketlc1KixnLj/pIWYeyyznp/IWrXFbF0hFPk7Xd++N1p2Wvx0H3jDvUyefBCFROvHWDzdpuddZjf+UVP+Zzi0uZFb+c8hRZq/VSvN/5stNWz0ayS/p6fCjD+bIXc+FAd7fJpxfpbVeN39Uv62tQXtVMl4Gar4nsgk4KBzvBsjwsmN+F2zlLklZVwtIta9upqJSN6UAlwrSlx1fEixGHe0UAZcw7IEP+lH9nLz+5Zlnne8WlRiwOD89SXmLxK6o+cHV6+PODbLx46Y1XD6LXKCtb7qSS5YPx7Sv5oZV5JFuTpRI7LQtKLndT9QM6ZQVVOUBgXX0e+YHHCs8d+WEi03Qmxzr/0UV+eo4uWT21v2uEVbXiY9VdS/PwRJ53iyyTxHUQAvldSYjxFFlt5WQVEchP9V1xmEzWGPfr/TSQ2N/jCsn9Vqh79Mja4C7WqCqra6Ssx/VKHlCQH/wguKgtbqpFlvwccqSN+4qWiFHaFHAeV4JF7LIzvUJWRau0AlnVVtKITrBKXVm1fr5ON4YGWfVcyW3h4qyarmrZai5LLboqY1F+QvkVlV1QnTwYgc+JjWUVghUE5X/c0g4axqnky7sGP1/Rc/UcWRfp4SqUR8yytFrSFa8cipaCbc81lCVrvKtS2m7tzUu/W5IOv5r9ev9hGKpVFiZuL8Mt7bUprRBPylbVqXg4oV8WMnIu4bv0vCWZe1aiFR+M5sGtQd9IlrxzVp3yDqRDPs3sSr40bP7r/V7JeZ8jq37UkCGJHxyhidgv7Q+oeJ6lzIMuMn2ypHU8irJlsBjbThxuHhflzW5JXycSzOiAJrLqhu4iFT1656/rONjLckrd0F2k4pmqTlnSBwtIHnW5SahqcGNAPKdrIKtOX0MZklLrEfXbOSKIVk99WVWDK3A8foZRQkVXPY65+gPN+rIq+sqR1NoWpapDFYeshtEpq0kTVkTspvIOEykgEWA63atRX3Crtix9uTA3FqMqyWRXVFwCtzZ95XxYW5aG8DlFeDamJkv+2BrPwwfdjWXpvNqT6omz22ragocol5m1ZYGrdb8HjRi1YEZQkuVlrdL7RDaWtor2KmssKfc91JXlgJYusqPjAUqyQCdO9fNtOVkFNVc9pK4s2C58gywQvtfdj22ZnUJ1S8S6smD5/gZZoDtZgyzFUXK1ZcFuvzfIAm14DbIqBhMI1JUFnxS8QRa4Uw2yHow0SqkrCx4ml7U7uioIQbSSLNDvp0GWalu6rizYSSqXpdqXCfu0lGSBvqxfI0u1G+XNssqfmhQhWcb/lrJO4JhfWGbBW2ouayk5s1QWaGxpkKV6irqy4Fi/5gU8ujYEnWkaZKmuil5Xlq8ka2nMZbjwAS3MB0qyQD+OBlmqkz/ryoLDEeoFpTCshX9aJVmgAaFBlupDgLqyQB+JBlmw+01JFmiaNpel3FVauz8LVN6NZR3h0B8lWdtsKHnHdGoA64iT6iXXlgVih3qywJBB4aG0Wk9p9reaCjtwKjPPdCuPd6gtC/QoWcEYTwDKDOFq1WTpGJOSoPwsrLYsXQ/vGcIDfDVZvr5fPyo/wK//3FDHgJ+IqTBaUU3WFjn/pQL14QP1ZeGnoMgQn3KqyYI1f0PUN+qpL+um7WrFMkNRlrbRA+q5sMkoGl1/W1c8raIsyRR9PIjtshrI8jVdbe5ZlqKshkPgMzATBRuM/NNTxE9z2UBV1llPEY8ZHdZElp5iI9+ZpCpL0wACzLjDRqOVdSStwiwHZVmehoHluGGHjWTpGPdTeAylLEtL8FKx8oxmWRqmOBTHKqvL0pCyVR9V6JDlNR7RVvzLImQ1HldaPnXoSbJMv+HVlnRGIWQ1Dh+Uh7FpkdWwSiorXjGyGo5pw45WajyTtcnlumWTJ1Cyek3i+LLJU8+VVXtCd9gqK503g5JlTuqHppUr2zxHlnmuPUOyvMTAyTK7dX+9NFk/W1ZtW5IhZEhZdW25yCm/mmSZ51oFh2xZL6ysqlUz5Fj4dKVpeZUaC5zMpfP80LLMCT5p13vGommVI+zzg4U8GsTLMh1slVxrJRp962f5qIutCnBqyEIuxTGtu0ymtpXZPPW/rlX5uLyWLHOiHsHsaq+lq3HNv4taQ/H4YFWTerJMc6wWcbnIJg5E62qSG4Ueptajv2tdWbkJ++XMcQs55NC7Tqkzro4i+p3H0U1tWWFRULlKKnt0jr4jAe0r4Hbv0uS1VHpOXjX1+vEVXSQL4IZ/qAGqo6+MJ6yt7Hy1ir1y1sBXDANtYyrhqNSl0vMHhcJ+erIbFFUpT1q12+v+2KOFxTjtWuMhYj0Ax5OjWo957XH48zP264t757rXtJb8R64H/6mQLAQkCwHJQkCyEJAsBCQLAclCQLIQkCwEJAsByUJAshCQLAQkCwHJQkCyEJAsBCQLAclCQLIQkCwEJAsByUJAshCQLAQkCwHJQkCyELxVVk91nd4P4a2yAulw9EC6U3hXOtBxU7m7uA7eKmsk3cfFlY5U/5ausV17JS1l3inL6cv2Y7zJp2xZsj2Y/BrTvJC8U1Ygnca2lm5LdZAuxbaTTwfSxTtlsWkG5UM9LakSW7LnL18To84OvhjeKIuvwFW6VReb51WuhO8gUyqYrVuA24APzxtkDYPV/nIZ7vlao9Nr++K3V18/2/CTXjxQll9T8uv8PSfWwBdGjBMQfy85JFrXLlndqadpxG2ON8i6lI1UX7LbO7hzPsKZf6EfvlicjrGZ0ZSNPXajQ+fhy9ncZePat4vog2i2wJF/Yk3Vl8RC8Y5s6BQWkzrGK8L4hYuw4rh1WxxaH02XmJTM6ag5Q+4h7ymzfDFxLbNck9tUC4QWuS36smPye/edakzoVeNNBbww4U6YUQP3w3SF+OEG0xAM0MRUh95KW5231YbpfKb8+lm3dDJJoaZM58u6uSgsWz14hpjLgeZtstL5bsd8azr9pBBjplPH8wFVtmXSU5s875IFNrHLzwFOc1uhnE5TY34Dx2zZM0l4pod3yeK35/JqMdfkydZpKNx4NtsrtyYE2IbnmU2ed8lit7dzzCFLYOKUaZZ8rK1vFD6IttwKPFaci+te8TXaTh4P4J4VNjDeJCvMhW6UBr7z+TBuF25PhVXbwub1aRv9X0x0YTKdsiq1N3puPnyTrHFWEk/mQg/VKq3qxvkMaiVhQVhhCu3DhXGPC7H9HLOUJpZ3yYKFzgZmNztbqGliCQXQfpYFDHeYD28W2Fdh98Suh497YLEFrz34D9PzZF8TQvbzcxrRjI+T9cmQLAQkCwHJQkCyEJAsBCQLAclCQLIQkCwEJAsByUJAshCQLAQkCwHJQkCyEJAsBCQLAclCQLIQkCwEJAsByUJAshCQLAQkCwHJQkCyEJAsBCQLAclCQLIQkCwEJAsByUJAshCQLAQkCwHJQkCyEJAsBI9k9YiYx7L2xrRPhEzZrM8Hsmpvlv776JIsdUgWApKFgGQhIFkISBYCkoWAZCEgWQhIFgKShYBkISBZCEgWApKFgGQhIFkISBYCkoWAZCEgWQhIFgKShYBkISBZCEgWApKFgGQhIFkISBYCkoWAZCEgWQhIFgKShYBkISBZCEgWgtfJmq/XY7jB3Gi87mR7OhnupvPDtlpbjsd3Tb+ondfJOm7jbUWzf5pAC9t5h+3u9PPBafmF2ZDtZZntXrVgM2HAvoTdeFemcXhBun5RNy+UNTLjrVY5fIeiW/pPtk+az15QyuKkPjjR5kPpHo6pyY7Ty++D+TG8sjYMf2ubbC7qmnwT33QHPjGPfiivlMVy3il+HaakfRDvc8yYxDvMfTSvlHUys6R0Nc3OLNsQkm0ct+Gv5rNZtBXk0ZrNpsZxNL7+2PntfGf2eNzZTSW/c1yEH9sLyacNeGlQejbNr/jlje3q24uiBSPaNDR6mRbwLKNaVrzTNtzT1ljGu5I66/KLjo/xtMdrL5V1TZMS24nPZVvrRcmJ7fYbfwJlOUG6Ofsq20kZ7Ax8mxt5pqvs42Hh02a8VNY9TT82L6Jstpch43hO7yyNs9zYR+Dz7ebSPVd9lqaug8GYbTx37ud+YspS3XYzGASOflsvleWmJdOQ72UcpS9DKM1ysvhWqzwmi8sg9noYJTOWxPzcT1yywu8Aikg9vLYhvY+TUj8urc5xi8fOAgdRVlyksc+jjaJdGKwFmcOYZfhOJ/lHWMP2ivm0Aa+VtY6T0jIuooI4e31lzUZB1iV+kzUkox2kw4TlpVmPmcu2RGZc4PUuhSaDBl4raxFnrE1cnISF2NmIElpS3wmy0ivzkzBsBVIOl521mIyokbDM/jkpZtNGvFYWSyHMyiEuTdyoxcOSQNJ7I8hKb3wT519m42JvYuyVCTboNqI/xk8n+bhzFvo5mvPizj+fX76VtgpX3FqowknyliArLZDWsaySXY9hI+le+HR7NPTxYlkDfneD9C++5mpWoFumWtasYENIWUVZ/3PKYiljwNJXXESF+aZnTGEd/zhlXe92RmcAT89krQfg4zXsm23Mq/vgV8zTOd2qnhViLouykgb2A1nTXmUFJ5xJP6+WFRZP3TA5OUn8E9b13zas06plsRZSRUfq1EsbUM/g1bLCis/bg5O2wphgAvuXH8j6FuLQjtDANngs4WRx6FVvAP9yWdNoK/E0Voqrt6yD4IGsfphvvUTHyBTCKiPKh11wkKe1Q/Hlzw0vXE5WsPDN7EFqeCCLl+EOL9WPG9PMN3fY4eaNv9dnv+T9x80dg+c7Ifphdxc3ZZJ/V8qKDvAu1y/efSNUhgzet38LglwfvxZeLovnO9Cg2wm5Mtf5B2Wlvc4dEEaNij/gg4hUc6/+6x/f780efLgaFkIOrO43SfPZ7QFZHXgd1jBy4fzke7M4y0OsSnPx/g5Zx/60D9sgU7ZAHPw4+Wf4wbH4Lqe/bNmthbQl446+7YHeHMihgSEISBYCkoWAZCEgWQhIFgKShYBkISBZCEgWApKFgGQhIFkISBYCkoWAZCEgWQieLMv1g7bWYcOjw3Af6BzsgeHJsthzPK3jyfhDm+Xj7z2FJ8uaaZYVPZMNHn/xKfxnsqLHYL3SpzrP5z+TNTFNzxHmKb6S/0sWKwLvl2xg7ov5v2SN2dg3Wxgb8UpeK8vatA+roZ3e6q41yLAtNoMJvNHK13psIoafP+fi+9sy+oPxV/oAut/yV4f9NXf0lL3b/WkSyLxSlptuAJjMULoJ4z+jobiA/IDQZTS64SBcVBhMfPNKMhnklo6FuMGH0nby7iE/xUydF8paAg1+9BZSVhDNo2Y2siEf4SWutpmsI5jolP2d4LtO7eEir5N14rdv7+5BLCak7U0Ytz0fyxHWcbYzieiWzFNicwvYEEGWjrJxN1FyPfxcolOyqPVsz6wl/5kkK3aZpJ/7iA2Nrz+C+XWy2uktzkIRZ7HJUpizxJJhL5dh0kmJKzjtlctKByWzCS/xmEs2gyCeusKGCK6il75ZP/J4nSwrSKecsLsWBhWzAmUC9bFZOYVWzVfi2IbHt+HdC5PWd+mf5/ht9pKxOZ6wQgKKVxbwsySlWDAtGPGANliSHCdCTsuOiqeGpa8MLivLVyysyNIj+MhNC/ug/sIR74iz+ndRFk9Gwhg+llcKgSdLT3HF3wb5uA1TSlfIzWxoc26YVt/d/y+y5kv7uudVF5TFSndh9Dqr7m6FfphDlk4GIJO2QSpjgdhtuI/5msC8PD0NNsMJ+7ukE7WxvFLW4ABq9UxWkK/3CrkyPVWSM1m9mHQ9QFlzx8wTy7Iu4KPPl9WfxGHO5PoDZbHcJUx15rmyMAqZh2Ar/2vI8L2s6+GBrCjjJoHqtr0+/A+yWLI6b0anvljA8wV8YNV4PMDiO+OW1xD7hLJYVRfMF4BTWn2afmvByv7rx8qyUlls/HuSc2aZLDYmWUxGLFfujQKLQpqJi2koi/1FSnoGWa7dJpXk/mNlZdOUv0CZbWeyWDNEmIDDPiubF3FlssfXiJ/NJC3WBFljIXQ4xj+4A7Uty6kfKstP8xicr3xLZbHSawUPWGbljADLYPCLLCaPm0xQ1klwv/aiM4HJ/bz0+kxZfCZN9HKVVfzXtDZkeVOM3HumGK8m7ExxkYZMniCLTw1KvndPCj8QaSw+szZsfQVbUA7/JGWWFc2qYUZYOjCvp7hTyz5FufK8vEfv2CBQ9c1cNMGKNh5wirJ4VdpmxbqVtaRZycmnphw7Hxo6xHNokvKWdzltLz4rbG7bSJbYIRPec26+uLhwm3ghLL/ybjFRVlwR9CZR6HsH19INWFeGd/5cWdlCRLusGmMrn+Bk2Wa+2cSCdd7k2ecCDWuSHu8lhd8xC4etdf1bep6sjXMYdmAni+vzkHEVZq72lt/H/dYF3AaGu9qDNw5ZFLC57fe5Dhv7tj+wrLWZ3L7FT+57/kOHFigN7TNP2Zs+WycvP/9VlZeOdZjOTqeXPGoIf2iWf7ZonU5NZ9TRwBAEJAsByUJAshCQLAQkCwHJQkCyEJAsBCQLAclCQLIQkCwEJAsByUJAshCQLAQkCwHJQkCyEJAsBCQLAclCQLIQkCwEJAsByUJAshCQLAQkCwHJQkCyEJAsBCQLAclCQLIQkCwEJAsByULwWNZqbhGc+eqhLAJCshCQLAQkC0GFrNl93CEA4/sTNooiCIIgCIIgCIIgCILI8w/JpCcyi3FGUAAAAABJRU5ErkJggg==";

const I = {
  hotel: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  ),
  msg: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  lock: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  refresh: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  logout: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  plus: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  check: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  back: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  trash: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  ),
  camera: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  image: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  phone: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  pkg: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  shield: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  list: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  wrench: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  bell: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  clock: (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  clock16: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  bed: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </svg>
  ),
  download: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  book: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  userplus: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  menu: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  droplet: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  zap: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  wind: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  ),
  hammer: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M15.45 5.05L19 8.6l-3.55 3.54-3.54-3.54z" />
      <path d="M9.09 11.09L2 18.17V22h3.83l7.08-7.08" />
    </svg>
  ),
  cal: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  users: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  wine: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 22h8" />
      <path d="M12 15v7" />
      <path d="M12 15a7 7 0 0 0 7-7V2H5v6a7 7 0 0 0 7 7z" />
    </svg>
  ),
  coffee: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  ),
  paint: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 3h16v6H2z" />
      <path d="M8 9v6a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v2" />
      <circle cx="13" cy="19" r="1" />
    </svg>
  ),
  leaf: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
};

const URG = {
  alta: { label: "Alta", fg: "#B23A2E", bg: "#FBE9E6", rank: 0 },
  media: { label: "Media", fg: "#C07A12", bg: "#FBF0DC", rank: 1 },
  bassa: { label: "Bassa", fg: "#2E7D5B", bg: "#E6F2EB", rank: 2 },
};
const CAT = {
  idraulico: { label: "Idraulico", icon: "droplet", color: "#2563EB" },
  elettrico: { label: "Elettrico", icon: "zap", color: "#D97706" },
  clima: { label: "Climatizzazione", icon: "wind", color: "#0E7490" },
  arredo: { label: "Arredo", icon: "hammer", color: "#7C5CFC" },
  edilizio: { label: "Edilizio", icon: "paint", color: "#92400E" },
  giardinaggio: { label: "Giardinaggio", icon: "leaf", color: "#16A34A" },
  filtri: { label: "Pulizia filtri", icon: "wind", color: "#0891B2" },
  idromassaggio: { label: "Idromassaggio", icon: "droplet", color: "#7C5CFC" },
  varie: { label: "Varie", icon: "wrench", color: "#6B7280" },
};
const ROOM_ST = {
  fermata_libera: { label: "Fermata libera", fg: "#7C5CFC", bg: "#EDE9FE" },
  fermata_cliente: {
    label: "Fermata con cliente",
    fg: "#B23A2E",
    bg: "#FBE9E6",
  },
  libera: { label: "Libera", fg: "#2E7D5B", bg: "#E6F2EB" },
  arrivo: { label: "In arrivo", fg: "#C07A12", bg: "#FBF0DC" },
};
const ROLES = {
  direzione: {
    label: "Direzione",
    desc: "Supervisione e statistiche",
    icon: "shield",
  },
  governante: {
    label: "Governante",
    desc: "Segnala dalle camere",
    icon: "list",
  },
  portiere_notturno: {
    label: "Portiere Notturno",
    desc: "Segnala durante il turno di notte",
    icon: "list",
  },
  manutentore: {
    label: "Manutentore",
    desc: "Esegue gli interventi",
    icon: "wrench",
  },
  reception: {
    label: "Reception",
    desc: "Segnala dal ricevimento",
    icon: "bell",
  },
  direttore_congressi: {
    label: "Direttore Centro Congressi",
    desc: "Supervisione Centro Congressi",
    icon: "cal",
  },
  sviluppatore: {
    label: "Sviluppatore",
    desc: "Accesso completo",
    icon: "shield",
  },
  responsabile_area: {
    label: "Area",
    desc: "Segnala per la propria zona",
    icon: "list",
  },
};
function roleDisplayFor(role, zones) {
  if (role !== "responsabile_area")
    return { label: ROLES[role]?.label, icon: ROLES[role]?.icon };
  const zz = (zones || []).map((z) => String(z).toLowerCase());
  if (zz.some((z) => z.includes("risto")))
    return { label: "Ristorante", icon: "wine" };
  if (zz.some((z) => z.includes("colazioni")))
    return { label: "Colazioni", icon: "coffee" };
  return { label: "Area", icon: "list" };
}
const DEF_TEC = [
  { id: "t1", nome: "Pecetti", telefono: "3341196935" },
  { id: "t2", nome: "Ciuffini", telefono: "3341196935" },
  { id: "t3", nome: "AIT", telefono: "3341196935" },
];
const DEF_USERS = [
  { id: "d1", name: "Alberto", role: "direzione", pin: "0000" },
  { id: "d2", name: "Paolo", role: "direttore_congressi", pin: "0000" },
  { id: "d3", name: "Michele", role: "direzione", pin: "0000" },
  { id: "d4", name: "Giovanna", role: "direzione", pin: "0000" },
  { id: "u1", name: "Domenico", role: "manutentore", pin: "0000" },
  { id: "u2", name: "Mario", role: "manutentore", pin: "0000" },
  { id: "u3", name: "Aly", role: "manutentore", pin: "0000" },
  { id: "u4", name: "Gianluca", role: "manutentore", pin: "0000" },
  { id: "u5", name: "Patricio", role: "manutentore", pin: "0000" },
  { id: "g1", name: "Giulia", role: "governante", pin: "0000" },
  { id: "r1", name: "Reception", role: "reception", pin: "0000" },
  { id: "pn1", name: "Michele C.", role: "portiere_notturno", pin: "0000" },
  { id: "pn2", name: "Marco", role: "portiere_notturno", pin: "0000" },
  { id: "pn3", name: "Amin", role: "portiere_notturno", pin: "0000" },
];
const ADMIN_PIN_DEFAULT = "0000";

const ST = {
  set(k, v) {
    try {
      localStorage.setItem("gm_" + k, JSON.stringify(v));
    } catch {}
  },
  get(k) {
    try {
      const v = localStorage.getItem("gm_" + k);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  del(k) {
    try {
      localStorage.removeItem("gm_" + k);
    } catch {}
  },
  all(p) {
    const o = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("gm_" + p)) {
          try {
            o[k.slice(3 + p.length)] = JSON.parse(localStorage.getItem(k));
          } catch {}
        }
      }
    } catch {}
    return o;
  },
};

const uid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
const fmt = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return (
    d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" }) +
    " · " +
    d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
  );
};
const fmtDate = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return (
    d.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }) +
    " · " +
    d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
  );
};
function compress(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const m = 1000;
        let { width: w, height: h } = img;
        if (w > h && w > m) {
          h = Math.round((h * m) / w);
          w = m;
        } else if (h > m) {
          w = Math.round((w * m) / h);
          h = m;
        }
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        res(c.toDataURL("image/jpeg", 0.62));
      };
      img.onerror = rej;
      img.src = e.target.result;
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function sortItems(arr) {
  return [...arr].sort((a, b) => {
    const ord = { todo: 0, tecnico: 1, waiting: 2, done: 3 };
    const d = (ord[a.status] ?? 0) - (ord[b.status] ?? 0);
    if (d) return d;
    if (a.status === "todo") {
      const r = (URG[a.urgency]?.rank ?? 1) - (URG[b.urgency]?.rank ?? 1);
      if (r) return r;
    }
    return a.createdAt - b.createdAt;
  });
}
function sortPlanned(arr) {
  return [...arr].sort((a, b) => {
    const sd = { pending: 0, waiting: 0, done: 1 };
    const d = (sd[a.status] ?? 0) - (sd[b.status] ?? 0);
    if (d) return d;
    return (a.scheduledAt || 0) - (b.scheduledAt || 0);
  });
}
function exportCSV(items) {
  const h = [
    "Camera",
    "Categoria",
    "Urgenza",
    "Stato",
    "Descrizione",
    "Pezzo sostituito",
    "Da",
    "Data",
  ];
  const rows = items.map((it) => [
    it.room,
    CAT[it.category]?.label || "",
    URG[it.urgency]?.label || "",
    it.status === "done"
      ? "Completata"
      : it.status === "waiting"
        ? "Attesa"
        : it.status === "tecnico"
          ? "Tecnico"
          : "Da fare",
    it.notes || "",
    it.pieceReplaced || "",
    it.createdBy || "",
    it.createdAt ? new Date(it.createdAt).toLocaleString("it-IT") : "",
  ]);
  const e = (v) => '"' + String(v).replace(/"/g, '""') + '"';
  const csv = [h, ...rows].map((r) => r.map(e).join(";")).join("\r\n");
  const b = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u;
  a.download = "manutenzioni_" + new Date().toISOString().slice(0, 10) + ".csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(u);
}

const inputSt = {
  width: "100%",
  background: "#fff",
  border: "1px solid #E4E0D6",
  borderRadius: 11,
  padding: "12px 13px",
  fontSize: 15,
  color: "#1B2420",
  outline: "none",
  fontFamily: "inherit",
};
const ctaSt = {
  width: "100%",
  background: "#0E5C49",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  padding: 14,
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label
      style={{
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 7,
      }}
    >
      {label}
    </label>
    {children}
  </div>
);
const ROOM_NUMBER_LIST = [...ROOM_NUMBERS].sort((a, b) => +a - +b);
// ── CameraZonaField: selettore Camera/Zona (sostituisce datalist nativo, che su iOS apre menu a schermo intero) ──
function CameraZonaField({
  value,
  onChange,
  placeholder,
  autoFocus,
  onModeChange,
}) {
  const [mode, setMode] = useState("camera");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef();
  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const q = value.trim().toLowerCase();
  const suggestions = q
    ? mode === "camera"
      ? ROOM_NUMBER_LIST.filter((r) => r.startsWith(q)).slice(0, 8)
      : ZONE_NAMES.filter((z) => z.toLowerCase().includes(q)).slice(0, 8)
    : [];
  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {" "}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {" "}
        {[
          ["camera", "Camera"],
          ["zona", "Zona"],
        ].map(([m, lbl]) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              onChange("");
              setOpen(false);
              onModeChange?.(m);
            }}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 9,
              border: "1.5px solid " + (mode === m ? "#0E5C49" : "#E4E0D6"),
              background: mode === m ? "#0E5C49" : "#fff",
              color: mode === m ? "#fff" : "#5C645E",
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            {lbl}
          </button>
        ))}{" "}
      </div>{" "}
      <input
        style={inputSt}
        inputMode={mode === "camera" ? "numeric" : "text"}
        pattern={mode === "camera" ? "[0-9]*" : undefined}
        placeholder={
          placeholder ||
          (mode === "camera"
            ? "Numero camera, es. 214"
            : "Cerca zona: Hall Jazz, Reception...")
        }
        value={value}
        onChange={(e) => {
          const v =
            mode === "camera"
              ? e.target.value.replace(/[^0-9]/g, "")
              : e.target.value;
          onChange(v);
          setOpen(!!v.trim());
        }}
        autoFocus={autoFocus}
      />{" "}
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "#fff",
            border: "1px solid #E4E0D6",
            borderRadius: 11,
            boxShadow: "0 6px 18px rgba(0,0,0,.14)",
            maxHeight: 220,
            overflowY: "auto",
            zIndex: 30,
          }}
        >
          {suggestions.map((s) => (
            <div
              key={s}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              style={{
                padding: "10px 13px",
                fontSize: 14,
                cursor: "pointer",
                borderBottom: "1px solid #F4F2ED",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}{" "}
    </div>
  );
}

// Pagina a schermo intero: usata per le sezioni che meritano spazio (es. Planning Sale)
function FullPage({ onClose, title, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "#F4F2ED",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: "#0E5C49",
          color: "#fff",
          padding: "calc(env(safe-area-inset-top, 0px) + 12px) 14px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Torna indietro"
          style={{
            background: "rgba(255,255,255,.14)",
            border: "none",
            color: "#fff",
            width: 34,
            height: 34,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          {I.back}
        </button>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h2>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "14px 16px calc(env(safe-area-inset-bottom, 0px) + 28px)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>{children}</div>
      </div>
    </div>
  );
}

function Sheet({ onClose, title, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(20,26,23,.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#F4F2ED",
          width: "100%",
          maxWidth: 760,
          maxHeight: "93vh",
          overflow: "auto",
          borderRadius: "20px 20px 0 0",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "#F4F2ED",
            padding: "16px 16px 6px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 2,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#fff",
              border: "1px solid #E4E0D6",
              color: "#1B2420",
              width: 34,
              height: 34,
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            {I.back}
          </button>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h2>
        </div>
        <div style={{ padding: "4px 16px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

function ManualViewer({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const lib = window.pdfjsLib;
      if (!lib || !ref.current) return;
      lib.GlobalWorkerOptions.workerSrc = window.PDFJS_WORKER_SRC;
      const pdf = await lib.getDocument("/manuale.pdf").promise;
      for (let n = 1; n <= pdf.numPages; n++) {
        if (cancelled) return;
        const page = await pdf.getPage(n);
        const vp0 = page.getViewport({ scale: 1 });
        const scale = (ref.current.clientWidth || 360) / vp0.width;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.display = "block";
        canvas.style.margin = "0 auto 10px";
        canvas.style.maxWidth = "100%";
        canvas.style.boxShadow = "0 2px 10px rgba(0,0,0,.25)";
        ref.current.appendChild(canvas);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport })
          .promise;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 85,
        background: "#1B2420",
        overflowY: "auto",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 2,
          background: "#fff",
          border: "none",
          color: "#1B2420",
          width: 38,
          height: 38,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,.3)",
        }}
      >
        {I.x}
      </button>
      <div ref={ref} style={{ padding: "60px 10px 30px" }} />
    </div>
  );
}
function ForceChangePin({ user, onDone, onFlash }) {
  const [old, setOld] = useState("");
  const [np, setNp] = useState("");
  const [np2, setNp2] = useState("");
  const [err, setErr] = useState("");
  const save = async () => {
    if (np !== np2) {
      setErr("I PIN non coincidono");
      return;
    }
    if (np === old) {
      setErr("Scegli un PIN diverso da quello attuale");
      return;
    }
    const users = await DB.loadUsers();
    const found = users.find(
      (u) =>
        u.name.trim().toLowerCase() === user.name.trim().toLowerCase() &&
        u.role === user.role,
    );
    if (!found) {
      setErr("Utente non trovato");
      return;
    }
    if (found.pin !== old) {
      setErr("PIN attuale errato");
      setOld("");
      return;
    }
    await DB.updateUserPin(user.name, user.role, np);
    onFlash("PIN aggiornato ✓");
    onDone(np);
  };
  const pIn = (val, set) => (
    <input
      style={{
        ...inputSt,
        textAlign: "center",
        fontSize: 20,
        letterSpacing: 8,
      }}
      type="password"
      inputMode="numeric"
      maxLength={4}
      placeholder="••••"
      value={val}
      onChange={(e) => set(e.target.value.replace(/\D/g, "").slice(0, 4))}
    />
  );
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#F4F2ED",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {" "}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 40px rgba(0,0,0,.15)",
        }}
      >
        {" "}
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
          Imposta un nuovo PIN
        </div>{" "}
        <div style={{ fontSize: 13, color: "#5C645E", marginBottom: 16 }}>
          Per motivi di sicurezza devi cambiare il PIN prima di continuare.
        </div>{" "}
        <Field label="PIN attuale">{pIn(old, setOld)}</Field>{" "}
        <Field label="Nuovo PIN">{pIn(np, setNp)}</Field>{" "}
        <Field label="Conferma nuovo PIN">{pIn(np2, setNp2)}</Field>{" "}
        {err && (
          <div style={{ color: "#B23A2E", fontSize: 13, marginBottom: 10 }}>
            {err}
          </div>
        )}{" "}
        <button
          onClick={save}
          disabled={old.length !== 4 || np.length !== 4 || np2.length !== 4}
          style={{
            ...ctaSt,
            opacity:
              old.length !== 4 || np.length !== 4 || np2.length !== 4 ? 0.5 : 1,
          }}
        >
          {I.check} Salva PIN
        </button>{" "}
      </div>{" "}
    </div>
  );
}
// ── Planning Sale ──────────────────────────────────────────────
// Sale del centro congressi, come nel planning cartaceo.
// "parts" elenca gli spazi base occupati: serve a bloccare le combinazioni
// (es. prenotando Trumpet 1+2 non sono piu' disponibili Trumpet 1 e Trumpet 2).
const SALE_DEF = [
  { name: "Guitar", parts: ["guitar"] },
  { name: "Drums", parts: ["drums"] },
  { name: "Room", parts: ["room"] },
  { name: "Preservation", parts: ["preservation"] },
  { name: "Cool", parts: ["cool"] },
  { name: "Trumpet 1", parts: ["t1"] },
  { name: "Trumpet 2", parts: ["t2"] },
  { name: "Trumpet 3", parts: ["t3"] },
  { name: "Trumpet 4", parts: ["t4"] },
  { name: "Trumpet 1+2", parts: ["t1", "t2"] },
  { name: "Trumpet 2+3", parts: ["t2", "t3"] },
  { name: "Trumpet 3+4", parts: ["t3", "t4"] },
  { name: "Trumpet 1+2+3", parts: ["t1", "t2", "t3"] },
  { name: "Trumpet 2+3+4", parts: ["t2", "t3", "t4"] },
  { name: "Trumpet 1+2+3+4", parts: ["t1", "t2", "t3", "t4"] },
  { name: "Sax 1", parts: ["s1"] },
  { name: "Sax 2", parts: ["s2"] },
  { name: "Sax 3", parts: ["s3"] },
  { name: "Sax 1+2", parts: ["s1", "s2"] },
  { name: "Sax 2+3", parts: ["s2", "s3"] },
  { name: "Sax 1+2+3", parts: ["s1", "s2", "s3"] },
  { name: "Auditorium", parts: ["auditorium"] },
  { name: "Cantina", parts: ["cantina"] },
  { name: "Gusto", parts: ["gusto"] },
  { name: "Cravatte", parts: ["cravatte"] },
  { name: "Sala delle Feste", parts: ["feste"] },
];
const SALE_CONGRESSI = SALE_DEF.map((s) => s.name);
const SALA_PARTS = Object.fromEntries(SALE_DEF.map((s) => [s.name, s.parts]));
// due sale sono in conflitto se condividono almeno uno spazio base
const saleInConflitto = (a, b) => {
  const pa = SALA_PARTS[a] || [];
  const pb = SALA_PARTS[b] || [];
  return pa.some((x) => pb.includes(x));
};
// Raggruppa le sale in famiglie: Trumpet e Sax hanno le combinazioni,
// le altre sono singole. Serve al form: scegli la famiglia e appaiono le combo.
const SALA_FAMILIES = (() => {
  const order = [];
  const map = {};
  for (const s of SALE_DEF) {
    const fam = s.name.startsWith("Trumpet")
      ? "Trumpet"
      : s.name.startsWith("Sax")
        ? "Sax"
        : s.name;
    if (!map[fam]) {
      map[fam] = [];
      order.push(fam);
    }
    map[fam].push(s.name);
  }
  return order.map((fam) => ({ fam, rooms: map[fam] }));
})();
// colori dei turni, come nel planning cartaceo
const SHIFT_COLORS = {
  mattina: { bg: "#E7EFFB", border: "#BBD1F0", fg: "#1D4ED8" },
  pomeriggio: { bg: "#FBE7F3", border: "#F0BFDC", fg: "#B0338B" },
  tutto_giorno: { bg: "#FBE9E6", border: "#F3CEC7", fg: "#B23A2E" },
};
const SHIFT_LABELS = {
  mattina: "Mattina",
  pomeriggio: "Pomeriggio",
  tutto_giorno: "Giornata intera",
};
const PLANNING_VIEWS = [
  { key: "giorno", label: "Giorno", days: 1 },
  { key: "settimana", label: "Settimana", days: 7 },
  { key: "quindicina", label: "Quindicina", days: 15 },
];
const WD_IT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const fmtISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDaysP = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const startOfDayP = (d) => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
};
const dayLabelP = (d) =>
  `${WD_IT[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

const planningNavBtnSt = {
  padding: "9px 14px",
  borderRadius: 10,
  border: "1px solid #E4E0D6",
  background: "#fff",
  color: "#1B2420",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};


function SlotSheet({ onClose, onSave, isBusy }) {
  const [fam, setFam] = useState(null);
  const [room, setRoom] = useState(null);
  const [date, setDate] = useState(() => fmtISO(new Date()));
  const [shift, setShift] = useState("mattina");
  const [client, setClient] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const famObj = SALA_FAMILIES.find((f) => f.fam === fam);
  const hasCombo = famObj && famObj.rooms.length > 1;

  const pickFamily = (f) => {
    setFam(f.fam);
    setRoom(f.rooms.length === 1 ? f.rooms[0] : null);
  };

  const occupata = room && isBusy(room, date, shift);
  const canSave = room && date && shift && client.trim() && !occupata && !busy;

  const save = async () => {
    if (!canSave) return;
    setBusy(true);
    await onSave({ room, date, shift, client: client.trim(), notes: notes.trim() });
    setBusy(false);
  };

  const shiftBtns = [
    ["mattina", "Mattina"],
    ["pomeriggio", "Pomeriggio"],
    ["tutto_giorno", "Tutto il giorno"],
  ];

  return (
    <Sheet onClose={onClose} title="Nuova prenotazione">
      <Field label="Sala *">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {SALA_FAMILIES.map((f) => {
            const sel = fam === f.fam;
            return (
              <button
                key={f.fam}
                onClick={() => pickFamily(f)}
                style={{
                  padding: "8px 13px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1.5px solid " + (sel ? "#0E5C49" : "#E4E0D6"),
                  background: sel ? "#E6F2EB" : "#fff",
                  color: sel ? "#0E5C49" : "#5C645E",
                }}
              >
                {f.fam}
              </button>
            );
          })}
        </div>
      </Field>
      {hasCombo && (
        <Field label="Combinazione *">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {famObj.rooms.map((r) => {
              const sel = room === r;
              const short = r.replace(fam + " ", "");
              return (
                <button
                  key={r}
                  onClick={() => setRoom(r)}
                  style={{
                    minWidth: 44,
                    padding: "8px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "1.5px solid " + (sel ? "#0E5C49" : "#E4E0D6"),
                    background: sel ? "#0E5C49" : "#fff",
                    color: sel ? "#fff" : "#5C645E",
                  }}
                >
                  {short}
                </button>
              );
            })}
          </div>
        </Field>
      )}
      <Field label="Data *">
        <input
          type="date"
          style={inputSt}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
      <Field label="Turno *">
        <div style={{ display: "flex", gap: 7 }}>
          {shiftBtns.map(([k, l]) => {
            const c = SHIFT_COLORS[k];
            const sel = shift === k;
            return (
              <button
                key={k}
                onClick={() => setShift(k)}
                style={{
                  flex: 1,
                  padding: "10px 6px",
                  borderRadius: 10,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1.5px solid " + (sel ? c.fg : "#E4E0D6"),
                  background: sel ? c.bg : "#fff",
                  color: sel ? c.fg : "#5C645E",
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
      </Field>
      {occupata && (
        <div style={{ fontSize: 12.5, color: "#B23A2E", marginBottom: 10 }}>
          {room} non e' disponibile in questo turno (sala gia' occupata o in
          conflitto con una combinazione).
        </div>
      )}
      <Field label="Cliente *">
        <input
          style={inputSt}
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Nome cliente/azienda"
        />
      </Field>
      <Field label="Note (opzionale)">
        <textarea
          style={{ ...inputSt, resize: "vertical", minHeight: 70 }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <button style={{ ...ctaSt, opacity: canSave ? 1 : 0.5 }} disabled={!canSave} onClick={save}>
        {I.check} Prenota
      </button>
    </Sheet>
  );
}
function PlanningSale({ user, onClose, onFlash }) {
  const canEdit =
    user.role === "direttore_congressi" || user.role === "sviluppatore";
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [view, setView] = useState("settimana");
  const [anchor, setAnchor] = useState(() => startOfDayP(new Date()));
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setPrenotazioni(await DB.loadPrenotazioni());
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("prenotazioni_sale_ch")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prenotazioni_sale" },
        () => load(),
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  const viewCfg = PLANNING_VIEWS.find((v) => v.key === view);
  const days = Array.from({ length: viewCfg.days }, (_, i) =>
    addDaysP(anchor, i),
  );

  const prev = () => setAnchor((a) => addDaysP(a, -viewCfg.days));
  const next = () => setAnchor((a) => addDaysP(a, viewCfg.days));
  const today = () => setAnchor(startOfDayP(new Date()));


  // disponibilita' di una sala in un turno, considerando anche le combinazioni
  // (es. Trumpet 1+2 rende occupate Trumpet 1 e Trumpet 2)
  const isBusy = (sala, dateStr, shift) => {
    const all = prenotazioni.filter(
      (p) =>
        p.date === dateStr &&
        (p.room === sala || saleInConflitto(p.room, sala)),
    );
    if (shift === "tutto_giorno") return all.length > 0;
    if (all.some((b) => b.shift === "tutto_giorno")) return true;
    return all.some((b) => b.shift === shift);
  };

  const handleSave = async ({ room, date, shift, client, notes }) => {
    if (isBusy(room, date, shift)) {
      onFlash("Sala non piu' disponibile in questo turno", false);
      setSelected(null);
      return;
    }
    const ok = await DB.savePrenotazione({
      id: newId(),
      room,
      date,
      shift,
      client,
      notes,
      createdBy: user.name,
      createdAt: Date.now(),
    });
    if (ok) {
      onFlash("Prenotazione salvata ✓");
      await load();
    } else {
      onFlash("Errore nel salvataggio", false);
    }
    setSelected(null);
  };

  const handleDelete = async (booking) => {
    if (!canEdit) return;
    if (!window.confirm(`Eliminare la prenotazione di "${booking.client}"?`))
      return;
    await DB.deletePrenotazione(booking.id);
    onFlash("Prenotazione eliminata");
    await load();
  };

  return (
    <FullPage onClose={onClose} title="Planning Sale">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {PLANNING_VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              flex: 1,
              padding: "9px 6px",
              borderRadius: 10,
              border: "1px solid #E4E0D6",
              background: view === v.key ? "#0E5C49" : "#fff",
              color: view === v.key ? "#fff" : "#1B2420",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}
      >
        <button onClick={prev} style={planningNavBtnSt}>
          {"‹"}
        </button>
        <button onClick={today} style={{ ...planningNavBtnSt, flex: 1 }}>
          Oggi
        </button>
        <button onClick={next} style={planningNavBtnSt}>
          {"›"}
        </button>
      </div>

      {/* legenda turni */}
      <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          ["mattina", "Mattina"],
          ["pomeriggio", "Pomeriggio"],
          ["tutto_giorno", "Tutto il giorno"],
        ].map(([k, l]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: SHIFT_COLORS[k].bg,
                border: "1px solid " + SHIFT_COLORS[k].border,
              }}
            />
            <span style={{ fontSize: 12, color: "#5C645E" }}>{l}</span>
          </div>
        ))}
      </div>

      {/* agenda: un blocco per giorno, con le sole prenotazioni */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingBottom: canEdit ? 84 : 12,
        }}
      >
        {days.map((d) => {
          const dateStr = fmtISO(d);
          const isToday = dateStr === fmtISO(new Date());
          const dayBookings = prenotazioni
            .filter((b) => b.date === dateStr)
            .sort((a, b) => {
              const ra = SALE_CONGRESSI.indexOf(a.room);
              const rb = SALE_CONGRESSI.indexOf(b.room);
              return ra - rb;
            });
          return (
            <div
              key={dateStr}
              style={{
                border: "1px solid #E4E0D6",
                borderRadius: 12,
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "9px 12px",
                  background: isToday ? "#E6F2EB" : "#FBFAF7",
                  borderBottom: "1px solid #F0EEE7",
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: isToday ? "#0E5C49" : "#1B2420",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{dayLabelP(d)}</span>
                {isToday && (
                  <span style={{ fontSize: 11, fontWeight: 700 }}>OGGI</span>
                )}
              </div>
              {dayBookings.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    fontSize: 12.5,
                    color: "#B5AF9E",
                    fontStyle: "italic",
                  }}
                >
                  Nessuna prenotazione
                </div>
              ) : (
                <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {dayBookings.map((b) => {
                    const c = SHIFT_COLORS[b.shift] || SHIFT_COLORS.tutto_giorno;
                    return (
                      <div
                        key={b.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 10px",
                          borderRadius: 9,
                          background: c.bg,
                          border: "1px solid " + c.border,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: c.fg }}>
                            {b.room}
                          </div>
                          <div
                            style={{
                              fontSize: 12.5,
                              color: "#1B2420",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {b.client}
                            {b.notes ? " \u00b7 " + b.notes : ""}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c.fg, whiteSpace: "nowrap" }}>
                          {SHIFT_LABELS[b.shift]}
                        </span>
                        {canEdit && (
                          <button
                            onClick={() => handleDelete(b)}
                            title="Elimina prenotazione"
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#B23A2E",
                              cursor: "pointer",
                              padding: 2,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {I.trash}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!canEdit && (
        <div style={{ marginTop: 12, fontSize: 12, color: "#5C645E" }}>
          Sola visualizzazione.
        </div>
      )}

      {canEdit && (
        <button
          onClick={() => setSelected(true)}
          style={{
            position: "fixed",
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0E5C49",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: "14px 24px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 10px 30px -8px rgba(14,92,73,.6)",
            zIndex: 65,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {I.plus} Nuova prenotazione
        </button>
      )}

      {selected && (
        <SlotSheet
          onClose={() => setSelected(null)}
          onSave={handleSave}
          isBusy={isBusy}
        />
      )}
    </FullPage>
  );
}

export default function App() {
  const [user, setUser] = useState(() => ST.get("ses"));
  const [items, setItems] = useState([]);
  const [planned, setPlanned] = useState([]);
  const [tec, setTec] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("segnalazioni"); // "segnalazioni" | "interventi"
  const [filter, setFilter] = useState("aperte");
  const [sheet, setSheet] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [toast, setToast] = useState(null);
  const [pinSheet, setPinSheet] = useState(false);
  // Avviso una-tantum per dispositivo sul bug dei PIN gia' risolto.
  // La chiave e' versionata (v1): per un futuro avviso diverso basta
  // cambiare il suffisso, senza dover toccare la logica.
  const [pinBugNotice, setPinBugNotice] = useState(
    () => !ST.get("pin_bug_notice_v1_seen"),
  );
  const dismissPinBugNotice = () => {
    ST.set("pin_bug_notice_v1_seen", true);
    setPinBugNotice(false);
  };
  const [manualOpen, setManualOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" && !navigator.onLine,
  );
  const [myWorkOpen, setMyWorkOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const toastRef = useRef();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("urgenza");
  const [sortDir, setSortDir] = useState("asc");
  const FILTERS =
    user?.role === "responsabile_area"
      ? ["aperte", "fatte", "tutte"]
      : ["aperte", "tec", "att", "fatte", "tutte"];
  const swipeRef = useRef(null);
  const swipeStart = useRef(null);
  const swipeAnim = useRef(null);
  const [swipeDir, setSwipeDir] = useState(null);

  const flash = (m, ok = true) => {
    setToast({ m, ok });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2500);
  };
  const REPORT_URL =
    "https://script.google.com/macros/s/AKfycbyQmNtdsN03jWice9r0FMKjEDNRmxTJo6HOUlf7c_ZmMy_NfMc3lyLNWQaUBPB9csI0Qw/exec";
  const aggiornaReport = async () => {
    flash("Aggiornamento report in corso…");
    try {
      await fetch(REPORT_URL, { method: "GET", mode: "no-cors" });
      setTimeout(() => flash("Report aggiornato ✓"), 1500);
    } catch (err) {
      flash("Errore aggiornamento report", false);
    }
  };
  const refresh = useCallback(async () => {
    const [its, plans, tecs] = await Promise.all([
      DB.loadItems(),
      DB.loadPlanned(),
      DB.loadTecnici(),
    ]);
    setItems(sortItems(its));
    setPlanned(sortPlanned(plans));
    setTec(tecs);
  }, []);
  const saveItem = async (m) => {
    setItems((prev) => sortItems([...prev.filter((i) => i.id !== m.id), m]));
    await DB.saveItem(m);
    refresh();
  };
  const removeItem = async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await DB.deleteItem(id);
    refresh();
  };
  const savePlanned = async (p) => {
    setPlanned((prev) =>
      sortPlanned([...prev.filter((i) => i.id !== p.id), p]),
    );
    await DB.savePlanned(p);
    refresh();
  };
  const removePlanned = async (id) => {
    setPlanned((prev) => prev.filter((i) => i.id !== id));
    await DB.deletePlanned(id);
    refresh();
  };
  const saveTec = async (l) => {
    setTec(l);
    await DB.saveTecnici(l);
    refresh();
  };
  const login = (role, name, mustChangePin) => {
    const u = { role, name: name.trim(), mustChangePin: !!mustChangePin };
    setUser(u);
    ST.set("ses", u);
  };
  const [allUsers, setAllUsers] = useState([]);
  useEffect(() => {
    DB.loadUsers().then((u) => setAllUsers(u));
  }, []);
  const myZones = allUsers.find((u) => u.name === user?.name)?.zones || [];
  const areaInfo =
    user && user.role === "responsabile_area"
      ? myZones
          .map((z) => String(z).toLowerCase())
          .some((z) => z.includes("risto"))
        ? { label: "Ristorante", icon: "wine" }
        : myZones
              .map((z) => String(z).toLowerCase())
              .some((z) => z.includes("colazioni"))
          ? { label: "Colazioni", icon: "coffee" }
          : { label: "Area", icon: "list" }
      : null;
  const myRoleLabel = areaInfo ? areaInfo.label : ROLES[user?.role]?.label;
  const myRoleIcon = areaInfo ? areaInfo.icon : ROLES[user?.role]?.icon;
  const logout = () => {
    setUser(null);
    ST.del("ses");
  };

  const switchTab = (t) => {
    setTab(t);
    setSearch("");
  };
  const onTouchStart = (e) => {
    swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    if (!swipeStart.current) return;
    const dx = e.changedTouches[0].clientX - swipeStart.current.x;
    const dy = e.changedTouches[0].clientY - swipeStart.current.y;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx) * 0.8) {
      swipeStart.current = null;
      return;
    }
    if (tab === "segnalazioni") {
      const idx = FILTERS.indexOf(filter);
      if (dx < 0 && idx < FILTERS.length - 1) {
        setSwipeDir("left");
        setFilter(FILTERS[idx + 1]);
      } else if (dx > 0 && idx > 0) {
        setSwipeDir("right");
        setFilter(FILTERS[idx - 1]);
      }
    }
    swipeStart.current = null;
    clearTimeout(swipeAnim.current);
    swipeAnim.current = setTimeout(() => setSwipeDir(null), 300);
  };

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      await refresh();
      if (mounted) setLoading(false);
    })();
    // Realtime: aggiorna quando altri dispositivi cambiano i dati
    const ch = supabase
      .channel("apice-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "segnalazioni" },
        (p) => {
          if (p.eventType === "INSERT") playNotifSound();
          refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "interventi" },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tecnici" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [user, refresh]);

  useEffect(() => {
    const on = () => setIsOffline(false),
      off = () => setIsOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    const fn = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, [refresh]);

  useEffect(() => {
    let lastTouch = 0;
    const blockDoubleTapZoom = (e) => {
      const now = Date.now();
      if (now - lastTouch < 350) {
        e.preventDefault();
      }
      lastTouch = now;
    };
    document.addEventListener("touchend", blockDoubleTapZoom, {
      passive: false,
    });
    return () => document.removeEventListener("touchend", blockDoubleTapZoom);
  }, []);

  if (!user) return <Login onLogin={login} />;
  if (user.mustChangePin)
    return (
      <ForceChangePin
        user={user}
        onFlash={flash}
        onDone={(np) => {
          const u = { ...user, pin: np, mustChangePin: false };
          setUser(u);
          ST.set("ses", u);
        }}
      />
    );

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#F4F2ED",
          fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#0E5C49",
            display: "grid",
            placeItems: "center",
            color: "#fff",
          }}
        >
          {I.hotel}
        </div>
        <div style={{ fontSize: 14, color: "#5C645E", fontWeight: 600 }}>
          Caricamento…
        </div>
      </div>
    );

  const cntPlan = {
    pending: planned.filter((p) => p.status === "pending").length,
    done: planned.filter((p) => p.status === "done").length,
  };
  const cnt = {
    todo: items.filter(
      (i) => i.status === "todo" && !i.tecnicoAskedBy,
    ).length,
    tec: items.filter(
      (i) =>
        i.status === "tecnico" ||
        (i.tecnicoAskedBy && i.status === "todo"),
    ).length,
    att: items.filter((i) => i.status === "waiting").length,
    done: items.filter((i) => i.status === "done").length + cntPlan.done,
    alta: items.filter(
      (i) =>
        i.status === "todo" && i.urgency === "alta" && !i.tecnicoAskedBy,
    ).length,
  };
  const fil = items.filter((i) => {
    const matchFilter =
      filter === "aperte"
        ? i.status === "todo" && !i.tecnicoAskedBy
        : filter === "att"
          ? i.status === "waiting"
          : filter === "tec"
            ? i.status === "tecnico" ||
              (i.tecnicoAskedBy && i.status === "todo")
            : filter === "fatte"
              ? i.status === "done"
              : true;
    if (!matchFilter) return false;
    if (
      myZones.length &&
      !myZones.some(
        (z) => String(i.room).trim().toLowerCase() === z.trim().toLowerCase(),
      )
    )
      return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(i.room).toLowerCase().includes(q) ||
      (i.notes || "").toLowerCase().includes(q) ||
      (i.createdBy || "").toLowerCase().includes(q)
    );
  });
  const sortedFil = [...fil].sort((a, b) => {
    let c = 0;
    if (sortBy === "urgenza")
      c = (URG[a.urgency]?.rank ?? 1) - (URG[b.urgency]?.rank ?? 1);
    else if (sortBy === "camera") c = compareRoom(a.room, b.room);
    else c = (a.createdAt || 0) - (b.createdAt || 0);
    return sortDir === "desc" ? -c : c;
  });

  const isAreaRole =
    user.role === "responsabile_area" || user.role === "sviluppatore";
  const filterRow1 = isAreaRole
    ? [["aperte", "Da fare", cnt.todo]]
    : [
        ["aperte", "Da fare", cnt.todo],
        ["tec", "Tecnico", cnt.tec],
        ["att", "Attesa pezzo", cnt.att],
      ];

  // ruoli che gestiscono la struttura (vedono tutto)
  const isGestione =
    user.role === "direzione" ||
    user.role === "direttore_congressi" ||
    user.role === "reception" ||
    user.role === "sviluppatore";
  // ruoli operativi che vedono gli interventi
  const vedeInterventi =
    isGestione || user.role === "manutentore";
  // ruoli che vedono il Planning Sale
  const vedePlanning = vedeInterventi;

  const menuItems = [
    {
      icon: I.refresh,
      label: "Aggiorna",
      fn: () => {
        refresh();
        setMenuOpen(false);
      },
    },
    // Switch tra le due strutture: solo per chi lavora stabilmente su
    // entrambe (3 manutentori in prestito + 3 portieri notturni di Hotel Giò).
    // Stesso PIN in entrambi i sistemi, un tocco per cambiare app.
    ...(["Domenico", "Aly", "Patricio", "Michele C.", "Marco", "Amin", "Michele"].includes(
      user.name,
    )
      ? [
          {
            icon: I.hotel,
            label: "Vai a Chocohotel",
            fn: () => {
              window.location.href =
                "https://chocohotel-git-main-apicehotel.vercel.app";
            },
          },
        ]
      : []),
    ...(isGestione
      ? [
          {
            icon: I.msg,
            label: "Centro WhatsApp",
            fn: () => {
              setSheet("wa");
              setMenuOpen(false);
            },
          },
        ]
      : []),
    {
      icon: I.lock,
      label: "Cambia PIN",
      fn: () => {
        setPinSheet(true);
        setMenuOpen(false);
      },
    },
    {
      icon: I.bell,
      label: "Notifiche",
      fn: () => {
        setNotifOpen(true);
        setMenuOpen(false);
      },
    },
    {
      icon: I.book,
      label: "Manuale",
      fn: () => {
        setManualOpen(true);
        setMenuOpen(false);
      },
    },
    {
      icon: I.msg,
      label: "Feedback",
      fn: () => {
        setFeedbackOpen(true);
        setMenuOpen(false);
      },
    },
    ...(user.role === "direzione" ||
    user.role === "direttore_congressi" ||
    user.role === "sviluppatore" ||
    user.role === "reception"
      ? [
          {
            icon: I.download,
            label: "Esporta CSV",
            fn: () => {
              exportCSV(items);
              setMenuOpen(false);
            },
            disabled: !items.length,
          },
          {
            icon: I.book,
            label: "Rubrica tecnici",
            fn: () => {
              setSheet("tec");
              setMenuOpen(false);
            },
          },
          {
            icon: I.refresh,
            label: "Aggiorna report",
            fn: () => {
              aggiornaReport();
              setMenuOpen(false);
            },
          },
        ]
      : []),
    ...(vedePlanning
      ? [
          {
            icon: I.clock,
            label: "Planning Sale",
            fn: () => {
              setPlanningOpen(true);
              setMenuOpen(false);
            },
          },
        ]
      : []),
    // "Manutenzioni" non e' ancora pronta: visibile solo allo sviluppatore
    ...(user.role === "sviluppatore"
      ? [
          {
            icon: I.wrench,
            label: "Manutenzioni",
            fn: () => {
              flash("Sezione in sviluppo");
              setMenuOpen(false);
            },
          },
        ]
      : []),
  ];

  const pendingPlanned = planned.filter(
    (p) => p.status === "pending" || p.status === "waiting",
  );
  const donePlanned = planned.filter((p) => p.status === "done");
  const filteredPlanned = pendingPlanned.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(p.room).toLowerCase().includes(q) ||
      (p.notes || "").toLowerCase().includes(q) ||
      p.assignees?.some((a) => a.name.toLowerCase().includes(q))
    );
  });
  const filteredDonePlanned = donePlanned.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      String(p.room).toLowerCase().includes(q) ||
      (p.notes || "").toLowerCase().includes(q) ||
      p.assignees?.some((a) => a.name.toLowerCase().includes(q))
    );
  });

  return (
    <div
      style={{
        background: "#F4F2ED",
        minHeight: "100vh",
        fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif",
        color: "#1B2420",
      }}
    >
      {/* Topbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#0E5C49",
          color: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,.15)",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {I.hotel}
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                Manutenzioni - Hotel Jazz & Wine
              </div>
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.75,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                Apicehotel
              </div>
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.2 }}>
                {myRoleLabel}
              </div>
            </div>
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                background: "rgba(255,255,255,.14)",
                border: "none",
                color: "#fff",
                width: 34,
                height: 34,
                borderRadius: 9,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {I.menu}
            </button>
          </div>
        </div>
        {/* Tab bar */}
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            borderTop: "1px solid rgba(255,255,255,.15)",
          }}
        >
          {[
            ["segnalazioni", "Segnalazioni", cnt.todo],
            ...(vedeInterventi
              ? [["interventi", "Interventi", cntPlan.pending]]
              : []),
          ].map(([k, l, n]) => (
            <button
              key={k}
              onClick={() => switchTab(k)}
              style={{
                flex: 1,
                padding: "10px 8px",
                background: "none",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                borderBottom:
                  "2px solid " + (tab === k ? "#fff" : "transparent"),
                opacity: tab === k ? 1 : 0.65,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {l}
              {n > 0 && (
                <span
                  style={{
                    background:
                      tab === k
                        ? "rgba(255,255,255,.25)"
                        : "rgba(255,255,255,.15)",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                  }}
                >
                  {n}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>
      {/* Menu laterale */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,.35)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: 260,
              zIndex: 70,
              background: "#fff",
              boxShadow: "-8px 0 30px rgba(0,0,0,.15)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: "#0E5C49",
                padding: "20px 16px 16px",
                color: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 15 }}>Menu</div>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    background: "rgba(255,255,255,.15)",
                    border: "none",
                    color: "#fff",
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {I.x}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255,255,255,.12)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(255,255,255,.2)",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                  }}
                >
                  {I[myRoleIcon]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>
                    {myRoleLabel}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {menuItems.map((v, i) => (
                <button
                  key={i}
                  onClick={v.fn}
                  disabled={v.disabled}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 20px",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #F4F2ED",
                    cursor: v.disabled ? "default" : "pointer",
                    color: v.disabled ? "#ccc" : "#1B2420",
                    fontSize: 14,
                    fontWeight: 500,
                    opacity: v.disabled ? 0.4 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: "#F4F2ED",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {v.icon}
                  </div>
                  {v.label}
                </button>
              ))}
              {/* I miei lavori — apre pagina dedicata */}
              <MyWorkBtn
                user={user}
                items={items}
                planned={planned}
                onOpen={() => {
                  setMyWorkOpen(true);
                  setMenuOpen(false);
                }}
              />
            </div>
            <div style={{ borderTop: "1px solid #F4F2ED" }}>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#B23A2E",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "#FBE9E6",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {I.logout}
                </div>
                Esci
              </button>
            </div>
          </div>
        </>
      )}
      {isOffline && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 95,
            pointerEvents: "none",
            background: "#8A6D2F",
            color: "#fff",
            padding: "10px 16px",
            fontSize: 12.5,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Sei offline — stai vedendo gli ultimi dati salvati. Le modifiche non
          verranno inviate.
        </div>
      )}
      {notifOpen && (
        <NotificheSettings
          user={user}
          flash={flash}
          onClose={() => setNotifOpen(false)}
        />
      )}
      {/* ===== TAB: SEGNALAZIONI ===== */}
      {tab === "segnalazioni" && (
        <main
          ref={swipeRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px 100px" }}
        >
          {(user.role === "direzione" ||
            user.role === "direttore_congressi" ||
            user.role === "sviluppatore" ||
            user.role === "reception") && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 10,
                marginTop: 14,
                marginBottom: 4,
              }}
            >
              {[
                ["Da fare", cnt.todo, "#B9842F"],
                ["Urgenti", cnt.alta, "#B23A2E"],
                ["Fatte", cnt.done, "#2E7D5B"],
              ].map(([k, n, c]) => (
                <div
                  key={k}
                  style={{
                    background: "#fff",
                    border: "1px solid #E4E0D6",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 26, fontWeight: 800, color: c }}>
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#5C645E",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginTop: 3,
                    }}
                  >
                    {k}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(" + filterRow1.length + ",1fr)",
              gap: 7,
              padding: "12px 0 7px",
            }}
          >
            {filterRow1.map(([k, l, n]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  padding: "8px 6px",
                  borderRadius: 11,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: filter === k ? "#1B2420" : "#fff",
                  color: filter === k ? "#fff" : "#5C645E",
                  border: "1px solid " + (filter === k ? "#1B2420" : "#E4E0D6"),
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {l} <span style={{ fontSize: 11, opacity: 0.7 }}>{n}</span>
              </button>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 7,
              paddingBottom: 8,
            }}
          >
            {[
              ["fatte", "Completate", cnt.done],
              ["tutte", "Tutte", items.length],
            ].map(([k, l, n]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  padding: "8px 6px",
                  borderRadius: 11,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: filter === k ? "#1B2420" : "#fff",
                  color: filter === k ? "#fff" : "#5C645E",
                  border: "1px solid " + (filter === k ? "#1B2420" : "#E4E0D6"),
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {l} <span style={{ fontSize: 11, opacity: 0.7 }}>{n}</span>
              </button>
            ))}
          </div>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca camera, descrizione..."
              style={{
                ...inputSt,
                paddingLeft: 36,
                paddingTop: 10,
                paddingBottom: 10,
                fontSize: 14,
                background: "#fff",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {I.x}
              </button>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: 7,
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                flex: 1,
                background: "#fff",
                border: "1px solid #E4E0D6",
                borderRadius: 11,
                padding: "9px 10px",
                fontSize: 13,
                fontWeight: 600,
                color: "#1B2420",
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              <option value="urgenza">Ordina: Urgenza</option>
              <option value="camera">Ordina: Numero camera</option>
              <option value="data">Ordina: Data</option>
            </select>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title="Inverti ordine"
              style={{
                background: "#fff",
                border: "1px solid #E4E0D6",
                color: "#1B2420",
                width: 38,
                height: 38,
                borderRadius: 11,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                flexShrink: 0,
                fontSize: 15,
              }}
            >
              {sortDir === "asc" ? "↓" : "↑"}
            </button>
          </div>
          {fil.length === 0 &&
          (filter !== "fatte" || filteredDonePlanned.length === 0) ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#5C645E",
              }}
            >
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "center",
                  opacity: 0.3,
                }}
              >
                {I.bed}
              </div>
              <div style={{ fontWeight: 600, color: "#1B2420" }}>
                Nessuna segnalazione
              </div>
            </div>
          ) : (
            <>
              {sortedFil.map((it) => (
                <Card
                  key={it.id}
                  it={it}
                  onOpen={() => setSheet({ d: it })}
                  onPhoto={setViewer}
                />
              ))}
              {filter === "fatte" && vedeInterventi && filteredDonePlanned.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#5C645E",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      margin: "14px 0 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {I.cal} Interventi pianificati ·{" "}
                    {filteredDonePlanned.length}
                  </div>
                  {filteredDonePlanned.map((p) => (
                    <PlannedCard
                      key={p.id}
                      p={p}
                      user={user}
                      onOpen={() => setSheet({ pd: p })}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </main>
      )}
      {/* ===== TAB: INTERVENTI PIANIFICATI ===== */}
      {tab === "interventi" && (
        <main
          style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px 100px" }}
        >
          {(user.role === "direzione" ||
            user.role === "direttore_congressi" ||
            user.role === "sviluppatore" ||
            user.role === "reception") &&
            cntPlan.pending > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 14,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #E4E0D6",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div
                    style={{ fontSize: 26, fontWeight: 800, color: "#1B2420" }}
                  >
                    {cntPlan.pending}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#5C645E",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginTop: 3,
                    }}
                  >
                    Da fare
                  </div>
                </div>
                <div
                  style={{
                    background: "#E6F2EB",
                    border: "1px solid #bfe2cf",
                    borderRadius: 14,
                    padding: 12,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setTab("segnalazioni");
                    setFilter("fatte");
                  }}
                >
                  <div
                    style={{ fontSize: 26, fontWeight: 800, color: "#2E7D5B" }}
                  >
                    {cntPlan.done}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#2E7D5B",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginTop: 3,
                    }}
                  >
                    Completati →
                  </div>
                </div>
              </div>
            )}

          {/* Solo Da completare — i completati vanno nella tab Segnalazioni > Completate */}
          <div style={{ position: "relative", marginTop: 10, marginBottom: 4 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca camera, nome, assegnatario..."
              style={{
                ...inputSt,
                paddingLeft: 36,
                paddingTop: 10,
                paddingBottom: 10,
                fontSize: 14,
                background: "#fff",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {I.x}
              </button>
            )}
          </div>
          {filteredPlanned.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5C645E",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  margin: "14px 0 8px",
                }}
              >
                Da completare · {filteredPlanned.length}
              </div>
              {filteredPlanned.map((p) => (
                <PlannedCard
                  key={p.id}
                  p={p}
                  user={user}
                  onOpen={() => setSheet({ pd: p })}
                />
              ))}
            </>
          )}

          {filteredPlanned.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#5C645E",
              }}
            >
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "center",
                  opacity: 0.3,
                }}
              >
                {I.cal}
              </div>
              <div style={{ fontWeight: 600, color: "#1B2420" }}>
                Nessun intervento da completare
              </div>
              {cntPlan.done > 0 && (
                <div
                  style={{
                    fontSize: 13,
                    marginTop: 6,
                    color: "#2E7D5B",
                    fontWeight: 600,
                  }}
                >
                  ✓ {cntPlan.done} completat{cntPlan.done === 1 ? "o" : "i"} —
                  vedi in Segnalazioni › Completate
                </div>
              )}
              {(user.role === "direzione" ||
                user.role === "direttore_congressi" ||
                user.role === "sviluppatore" ||
                user.role === "reception") && (
                <div style={{ fontSize: 13, marginTop: 6 }}>
                  Usa il pulsante + per crearne uno
                </div>
              )}
            </div>
          )}
        </main>
      )}
      {/* FAB */}
      <button
        onClick={() => setSheet(tab === "segnalazioni" ? "new" : "newplan")}
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: tab === "interventi" ? "#1D4ED8" : "#B9842F",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          padding: "14px 24px",
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxShadow:
            tab === "interventi"
              ? "0 10px 30px -8px rgba(29,78,216,.5)"
              : "0 10px 30px -8px rgba(185,132,47,.6)",
          zIndex: 30,
          display:
            tab === "interventi" &&
            !(
              user.role === "direzione" ||
              user.role === "direttore_congressi" ||
              user.role === "reception" ||
              user.role === "sviluppatore"
            )
              ? "none"
              : "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {I.plus}{" "}
        {tab === "segnalazioni" ? "Nuova segnalazione" : "Nuovo intervento"}
      </button>
      {sheet === "new" && (
        <NewForm
          user={user}
          zones={myZones}
          onClose={() => setSheet(null)}
          onSave={(m) => {
            saveItem(m);
            setSheet(null);
            flash("Segnalazione inviata");
          }}
        />
      )}
      {sheet === "newplan" &&
        (user.role === "direzione" ||
          user.role === "direttore_congressi" ||
          user.role === "sviluppatore" ||
          user.role === "reception") && (
          <NewPlanned
            user={user}
            tec={tec}
            onClose={() => setSheet(null)}
            onSave={(p) => {
              savePlanned(p);
              setSheet(null);
              flash("Intervento pianificato ✓");
            }}
          />
        )}
      {sheet === "wa" && (
        <WACenter
          user={user}
          items={items}
          onSave={saveItem}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === "tec" && (
        <Tecnici tec={tec} onSave={saveTec} onClose={() => setSheet(null)} />
      )}
      {sheet?.d && (
        <Detail
          user={user}
          it={items.find((i) => i.id === sheet.d.id) || sheet.d}
          tec={tec}
          onClose={() => setSheet(null)}
          onPhoto={setViewer}
          onSave={saveItem}
          onDelete={(id) => {
            removeItem(id);
            setSheet(null);
            flash("Eliminata", false);
          }}
          onFlash={flash}
        />
      )}
      {sheet?.pd && (
        <PlannedDetail
          user={user}
          p={planned.find((p) => p.id === sheet.pd.id) || sheet.pd}
          onClose={() => setSheet(null)}
          onSave={savePlanned}
          onDelete={(id) => {
            removePlanned(id);
            setSheet(null);
            flash("Eliminato", false);
          }}
          onFlash={flash}
          onPhoto={(src) => setViewer(src)}
        />
      )}
      {myWorkOpen && (
        <MyWorkPage
          user={user}
          items={items}
          planned={planned}
          onClose={() => setMyWorkOpen(false)}
          onOpen={(s) => {
            setSheet(s);
            setMyWorkOpen(false);
          }}
        />
      )}
      {pinSheet && (
        <ChangePIN
          user={user}
          onClose={() => setPinSheet(false)}
          onFlash={flash}
        />
      )}{" "}
      {pinBugNotice && !user.mustChangePin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,36,32,.45)",
            zIndex: 90,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={dismissPinBugNotice}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 480,
              borderRadius: "18px 18px 0 0",
              padding: "20px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
              🔧 Bug dei PIN risolto
            </div>
            <div
              style={{
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "#3a4340",
                marginBottom: 16,
              }}
            >
              Nei giorni scorsi un errore poteva riportare alcuni PIN al
              valore iniziale <b>0000</b>. Il problema è stato corretto. Se
              da oggi il tuo PIN non funziona più, prova ad entrare con{" "}
              <b>0000</b> e poi impostane subito uno nuovo da qui sotto.
            </div>
            <button
              onClick={() => {
                dismissPinBugNotice();
                setPinSheet(true);
              }}
              style={{ ...ctaSt, marginBottom: 8 }}
            >
              Cambia il PIN ora
            </button>
            <button
              onClick={dismissPinBugNotice}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#5C645E",
                fontSize: 13,
                padding: 8,
                cursor: "pointer",
              }}
            >
              Va tutto bene, chiudi
            </button>
          </div>
        </div>
      )}
      {viewer && (
        <div
          onClick={() => setViewer(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(0,0,0,.92)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            cursor: "pointer",
          }}
        >
          <img
            src={viewer}
            alt=""
            style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 10 }}
          />
        </div>
      )}{" "}
      {manualOpen && <ManualViewer onClose={() => setManualOpen(false)} />}{" "}
      {feedbackOpen && (
        <FeedbackForm
          user={user}
          onClose={() => setFeedbackOpen(false)}
          onFlash={flash}
        />
      )}
      {planningOpen && (
        <PlanningSale
          user={user}
          onClose={() => setPlanningOpen(false)}
          onFlash={flash}
        />
      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1B2420",
            color: "#fff",
            padding: "11px 16px",
            borderRadius: 11,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 90,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {toast.ok ? I.check : I.x} {toast.m}
        </div>
      )}
    </div>
  );
}

// ── Card segnalazione ─────────────────────────────────────────────────────────
function isRoomNumber(camera) {
  return /^\d{3,4}$/.test(String(camera || "").trim());
}
function zoneFontSize(v) {
  if (isRoomNumber(v)) return 18;
  const n = String(v || "").length;
  if (n > 13) return 12;
  if (n > 9) return 14;
  return 16;
}
function compareRoom(a, b) {
  const an = isRoomNumber(a),
    bn = isRoomNumber(b);
  if (an && bn) return parseInt(a, 10) - parseInt(b, 10);
  if (an && !bn) return -1;
  if (!an && bn) return 1;
  return String(a || "").localeCompare(String(b || ""), "it", {
    sensitivity: "base",
  });
}
function Card({ it, onOpen, onPhoto }) {
  const u = URG[it.urgency] || URG.media;
  const st = it.status === "tecnico"
    ? { l: "Tecnico contattato", bg: "#FEF3C7", fg: "#92400E" }
    : it.tecnicoAskedBy && it.status === "todo"
      ? { l: "Contattare tecnico", bg: "#FEF3C7", fg: "#92400E" }
      : {
          todo: { l: "Da fare", bg: "#F1E4CC", fg: "#7a5212" },
          done: { l: "Completata", bg: "#E6F2EB", fg: "#2E7D5B" },
          waiting: { l: "Attesa pezzo", bg: "#EDE9FE", fg: "#7C3AED" },
        }[it.status] || { l: "Da fare", bg: "#F1E4CC", fg: "#7a5212" };
  return (
    <div
      onClick={onOpen}
      style={{
        background: "#fff",
        border: "1px solid #E4E0D6",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      <div style={{ width: 6, background: u.fg, flexShrink: 0 }} />
      <div style={{ padding: "12px 14px", flex: 1 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div
            style={{
              width: 88,
              minHeight: 62,
              borderRadius: 11,
              background: "#FBFAF7",
              border: "1px solid #E4E0D6",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 7,
                color: "#B9842F",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {isRoomNumber(it.room) ? "Cam." : "Zona"}
            </div>
            <div
              style={{
                fontSize: zoneFontSize(it.room),
                fontWeight: 800,
                lineHeight: 1.05,
                textAlign: "center",
                padding: "0 2px",
              }}
            >
              {it.room}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: u.bg,
                  color: u.fg,
                  textTransform: "uppercase",
                }}
              >
                {u.label}
              </span>
              {CAT[it.category] && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: CAT[it.category].color + "14",
                    color: CAT[it.category].color,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {I[CAT[it.category].icon]} {CAT[it.category].label}
                </span>
              )}
              {it.roomStatus && ROOM_ST[it.roomStatus] && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: ROOM_ST[it.roomStatus].bg,
                    color: ROOM_ST[it.roomStatus].fg,
                  }}
                >
                  {ROOM_ST[it.roomStatus].label}
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: st.bg,
                  color: st.fg,
                }}
              >
                {st.l}
              </span>
            </div>
            <div
              style={{ fontSize: 14, lineHeight: 1.4, wordBreak: "break-word" }}
            >
              {it.notes || <em style={{ color: "#5C645E" }}>Nessuna nota</em>}
            </div>
            <div style={{ fontSize: 11, color: "#5C645E", marginTop: 5 }}>
              Da {it.createdBy} · {fmt(it.createdAt)}
              {it.status === "done" && (
                <>
                  {" "}
                  ·{" "}
                  <span style={{ color: "#2E7D5B", fontWeight: 600 }}>
                    Risolta da{" "}
                    {it.tecnicoCompleted ? it.tecnicoNome : it.completedBy}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {(it.photoBefore || it.photoAfter) && (
          <div
            style={{ display: "flex", gap: 8, marginTop: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            {it.photoBefore && (
              <div>
                <img
                  src={it.photoBefore}
                  alt=""
                  onClick={() => onPhoto(it.photoBefore)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid #E4E0D6",
                    cursor: "pointer",
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    color: "#5C645E",
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  Prima
                </div>
              </div>
            )}{" "}
            {it.photoAfter && (
              <div>
                <img
                  src={it.photoAfter}
                  alt=""
                  onClick={() => onPhoto(it.photoAfter)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    objectFit: "cover",
                    border: "1px solid #E4E0D6",
                    cursor: "pointer",
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    color: "#5C645E",
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  Dopo
                </div>
              </div>
            )}{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
} // ── Card intervento pianificato ───────────────────────────────────────────────
function PlannedCard({ p, user, onOpen }) {
  const done = p.status === "done";
  const isAssigned = p.assignees?.some(
    (a) => a.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
  );
  return (
    <div
      onClick={onOpen}
      style={{
        background: "#fff",
        border:
          "1.5px solid " +
          (done ? "#bfe2cf" : isAssigned ? "#93C5FD" : "#E4E0D6"),
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        marginBottom: 10,
        cursor: "pointer",
        opacity: done ? 0.75 : 1,
      }}
    >
      {" "}
      <div
        style={{
          width: 6,
          background: done ? "#2E7D5B" : "#1D4ED8",
          flexShrink: 0,
        }}
      />{" "}
      <div style={{ padding: "12px 14px", flex: 1 }}>
        {" "}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          {" "}
          <div
            style={{
              width: 88,
              minHeight: 62,
              borderRadius: 11,
              background: done ? "#E6F2EB" : "#EFF6FF",
              border: "1px solid " + (done ? "#bfe2cf" : "#BFDBFE"),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {" "}
            <div
              style={{
                fontSize: 7,
                color: done ? "#2E7D5B" : "#1D4ED8",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {isRoomNumber(p.room) ? "Cam." : "Zona"}
            </div>{" "}
            <div
              style={{
                fontSize: zoneFontSize(p.room),
                fontWeight: 800,
                lineHeight: 1.05,
                color: done ? "#2E7D5B" : "#1D4ED8",
                textAlign: "center",
                padding: "0 2px",
              }}
            >
              {p.room}
            </div>{" "}
          </div>{" "}
          <div style={{ flex: 1, minWidth: 0 }}>
            {" "}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 4,
                alignItems: "center",
              }}
            >
              {" "}
              {CAT[p.category] && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: CAT[p.category].color + "14",
                    color: CAT[p.category].color,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {I[CAT[p.category].icon]} {CAT[p.category].label}
                </span>
              )}{" "}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: done
                    ? "#E6F2EB"
                    : p.status === "waiting"
                      ? "#EDE9FE"
                      : "#EFF6FF",
                  color: done
                    ? "#2E7D5B"
                    : p.status === "waiting"
                      ? "#7C3AED"
                      : "#1D4ED8",
                }}
              >
                {done
                  ? "Completato"
                  : p.status === "waiting"
                    ? "Attesa pezzo"
                    : "Pianificato"}
              </span>{" "}
              {isAssigned && !done && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "#FEF3C7",
                    color: "#92400E",
                  }}
                >
                  Tu
                </span>
              )}{" "}
            </div>{" "}
            <div
              style={{ fontSize: 14, lineHeight: 1.4, wordBreak: "break-word" }}
            >
              {p.notes || <em style={{ color: "#5C645E" }}>Nessuna nota</em>}
            </div>{" "}
            {Array.isArray(p.rooms) && p.rooms.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 7, borderRadius: 4, background: "#E9F3F5", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width:
                        Math.round((Object.keys(p.roomsDone || {}).length / p.rooms.length) * 100) + "%",
                      background: "#0891B2",
                      transition: "width .3s",
                    }}
                  />
                </div>
                <div style={{ fontSize: 11.5, color: "#0E7490", marginTop: 4, fontWeight: 600 }}>
                  {Object.keys(p.roomsDone || {}).length} di {p.rooms.length} camere ·{" "}
                  {Math.round((Object.keys(p.roomsDone || {}).length / p.rooms.length) * 100)}%
                </div>
              </div>
            )}
            <div
              style={{
                fontSize: 11,
                color: "#5C645E",
                marginTop: 5,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {" "}
              {I.clock}{" "}
              {p.scheduledAt
                ? fmtDate(p.scheduledAt)
                : "Data non impostata"}{" "}
            </div>{" "}
            {p.assignees?.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  marginTop: 6,
                  flexWrap: "wrap",
                }}
              >
                {" "}
                {p.assignees.map((a, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 9px",
                      borderRadius: 999,
                      background: "#F4F2ED",
                      color: "#1B2420",
                      border: "1px solid #E4E0D6",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {" "}
                    {I[ROLES[a.role]?.icon] || I.users} {a.name}{" "}
                  </span>
                ))}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
} // ── Nuovo intervento pianificato ──────────────────────────────────────────────
function NewPlanned({ user, tec, onClose, onSave }) {
  const [room, setRoom] = useState("");
  const [cat, setCat] = useState("varie");
  const [piano, setPiano] = useState(null);
  const [notes, setNotes] = useState("");
  const [dt, setDt] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    DB.loadUsers().then((u) => setUsers(u));
  }, []);
  const eligible = users.filter((u) => u.role === "manutentore");
  /* tecnici esterni dalla rubrica, con id prefissato "ext_" per distinguerli */ const extTec =
    (tec || []).map((t) => ({
      id: "ext_" + t.id,
      name: t.nome,
      role: "esterno",
      isExt: true,
      telefono: t.telefono || "",
    }));
  const toggleA = (u) => {
    setAssignees((prev) =>
      prev.some((a) => a.id === u.id)
        ? prev.filter((a) => a.id !== u.id)
        : [
            ...prev,
            { id: u.id, name: u.name, role: u.role, isExt: u.isExt || false },
          ],
    );
  };
  const roomTrim = room.trim();
  const camCheck = roomTrim ? resolveCamera(roomTrim) : null;
  const camInvalid = !!(camCheck && !camCheck.ok);
  const camResolved = camCheck && camCheck.ok ? camCheck.value : null;
  const isFiltri = cat === "filtri" || cat === "idromassaggio";
  const pianiDisponibili =
    cat === "idromassaggio" ? PIANI.filter((pi) => pi.id.startsWith("jazz")) : PIANI;
  useEffect(() => {
    // se il piano scelto non e' piu' valido per la categoria, azzera
    if (piano && !pianiDisponibili.some((pi) => pi.id === piano.id)) setPiano(null);
  }, [cat]);
  // l'idromassaggio e' solo nelle camere pari
  const camereDelPiano = piano
    ? cat === "idromassaggio"
      ? piano.rooms.filter((r) => Number(r) % 2 === 0)
      : piano.rooms
    : [];
  const canSave = isFiltri
    ? !!piano && dt && assignees.length > 0
    : roomTrim && notes.trim() && dt && assignees.length > 0 && !camInvalid;
  const AssigneeRow = ({ u, accent }) => {
    const sel = assignees.some((a) => a.id === u.id);
    return (
      <div
        onClick={() => toggleA(u)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 13px",
          borderRadius: 12,
          border: "1.5px solid " + (sel ? accent : "#E4E0D6"),
          background: sel ? accent + "11" : "#fff",
          cursor: "pointer",
        }}
      >
        {" "}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: sel ? accent + "22" : "#F4F2ED",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            color: sel ? accent : "#5C645E",
          }}
        >
          {" "}
          {u.isExt ? I.phone : I[ROLES[u.role]?.icon] || I.users}{" "}
        </div>{" "}
        <div style={{ flex: 1 }}>
          {" "}
          <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>{" "}
          <div style={{ fontSize: 12, color: "#5C645E" }}>
            {u.isExt ? "Tecnico esterno" : ROLES[u.role]?.label}
          </div>{" "}
        </div>{" "}
        {u.isExt && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 999,
              background: "#FEF3C7",
              color: "#92400E",
            }}
          >
            EXT
          </span>
        )}{" "}
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid " + (sel ? accent : "#D1CFC8"),
            background: sel ? accent : "transparent",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {" "}
          {sel && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}{" "}
        </div>{" "}
      </div>
    );
  };
  return (
    <Sheet onClose={onClose} title="Nuovo intervento pianificato">
      {" "}
      {isFiltri ? (
        <Field label="Piano *">
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {pianiDisponibili.map((pi) => {
              const sel = piano?.id === pi.id;
              return (
                <button
                  key={pi.id}
                  onClick={() => setPiano(pi)}
                  style={{
                    padding: "9px 13px",
                    borderRadius: 11,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1.5px solid " + (sel ? "#0891B2" : "#E4E0D6"),
                    background: sel ? "#0891B211" : "#fff",
                    color: sel ? "#0E7490" : "#5C645E",
                  }}
                >
                  {pi.label}
                </button>
              );
            })}
          </div>
          {piano && (
            <div style={{ fontSize: 12, color: "#0E7490", marginTop: 8 }}>
              {camereDelPiano.length} camere da spuntare · dalla{" "}
              {camereDelPiano[0]} alla{" "}
              {camereDelPiano[camereDelPiano.length - 1]}
              {cat === "idromassaggio" && " (solo camere pari)"}
            </div>
          )}
        </Field>
      ) : (
        <Field label="Numero camera *">
          {" "}
          <CameraZonaField value={room} onChange={setRoom} autoFocus />
          {camInvalid && (
            <div style={{ fontSize: 12, color: "#B23A2E", marginTop: 6 }}>
              Numero camera o zona non valida. Controlla il numero o scegli una
              zona nota (es. Hall Jazz, Reception...).
            </div>
          )}
          {camResolved && camResolved !== roomTrim && (
            <div style={{ fontSize: 12, color: "#2E7D5B", marginTop: 6 }}>
              Zona riconosciuta: {camResolved}
            </div>
          )}{" "}
        </Field>
      )}{" "}
      <Field label="Categoria *">
        {" "}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {" "}
          {Object.entries(CAT).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setCat(k)}
              style={{
                padding: "9px 12px",
                borderRadius: 11,
                border: "1.5px solid " + (cat === k ? v.color : "#E4E0D6"),
                background: cat === k ? v.color + "14" : "#fff",
                color: cat === k ? v.color : "#5C645E",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {I[v.icon]} {v.label}
            </button>
          ))}{" "}
        </div>{" "}
      </Field>{" "}
      <Field label="Descrizione *">
        {" "}
        <textarea
          style={{
            ...inputSt,
            resize: "vertical",
            minHeight: 70,
            lineHeight: 1.5,
          }}
          placeholder="Descrivi l'intervento..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />{" "}
      </Field>{" "}
      <Field label="Data e ora prevista *">
        {" "}
        <input
          style={inputSt}
          type="datetime-local"
          value={dt}
          onChange={(e) => setDt(e.target.value)}
        />{" "}
      </Field>{" "}
      <Field label="Assegna a *">
        {" "}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {" "}
          {eligible.length === 0 && extTec.length === 0 && (
            <div style={{ fontSize: 13, color: "#5C645E", padding: "10px 0" }}>
              Nessun utente o tecnico disponibile.
            </div>
          )}{" "}
          {eligible.length > 0 && (
            <>
              {" "}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5C645E",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 2,
                }}
              >
                Personale interno
              </div>{" "}
              {eligible.map((u) => (
                <AssigneeRow key={u.id} u={u} accent="#0E5C49" />
              ))}{" "}
            </>
          )}{" "}
          {extTec.length > 0 && (
            <>
              {" "}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5C645E",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  margin: "8px 0 2px",
                }}
              >
                Tecnici esterni
              </div>{" "}
              {extTec.map((u) => (
                <AssigneeRow key={u.id} u={u} accent="#D97706" />
              ))}{" "}
            </>
          )}{" "}
        </div>{" "}
      </Field>{" "}
      {!canSave && (
        <div
          style={{
            fontSize: 12,
            color: "#92400E",
            background: "#FFFBEB",
            border: "1px solid #FCD34D",
            borderRadius: 9,
            padding: "8px 12px",
            marginBottom: 12,
          }}
        >
          Compila tutti i campi (*) per pianificare l'intervento.
        </div>
      )}{" "}
      <button
        onClick={() =>
          onSave({
            id: uid(),
            room: isFiltri ? piano.label : camResolved || roomTrim,
            category: cat,
            notes: isFiltri
              ? notes.trim() || CAT[cat].label + " " + piano.label
              : notes.trim(),
            scheduledAt: dt ? new Date(dt).getTime() : null,
            assignees,
            status: "pending",
            createdBy: user.name,
            createdAt: Date.now(),
            completedBy: null,
            completedAt: null,
            rooms: isFiltri ? camereDelPiano : null,
            roomsDone: {},
          })
        }
        disabled={!canSave}
        style={{ ...ctaSt, background: "#1D4ED8", opacity: canSave ? 1 : 0.5 }}
      >
        {" "}
        {I.cal} Pianifica intervento{" "}
      </button>{" "}
    </Sheet>
  );
}
// ── Dettaglio intervento pianificato ─────────────────────────────────────────
function PlannedDetail({
  user,
  p,
  onClose,
  onSave,
  onDelete,
  onFlash,
  onPhoto,
}) {
  const done = p.status === "done";
  const waiting = p.status === "waiting";
  const isAssigned = p.assignees?.some(
    (a) => a.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
  );
  const roomsDone = p.roomsDone || {};
  const hasRooms = Array.isArray(p.rooms) && p.rooms.length > 0;
  const doneCount = Object.keys(roomsDone).length;
  const pct = hasRooms ? Math.round((doneCount / p.rooms.length) * 100) : 0;
  const canTick =
    !done &&
    (isAssigned ||
      ["manutentore", "direzione", "reception", "direttore_congressi", "sviluppatore"].includes(
        user.role,
      ));
  const toggleRoom = (r) => {
    if (!canTick) return;
    const next = { ...roomsDone };
    if (next[r]) delete next[r];
    else next[r] = { by: user.name, at: Date.now() };
    onSave({ ...p, roomsDone: next });
  };
  const canComplete =
    (user.role === "direzione" ||
      user.role === "direttore_congressi" ||
      user.role === "reception" ||
      user.role === "sviluppatore" ||
      user.role === "manutentore" ||
      (isAssigned &&
        user.role !== "governante" &&
        user.role !== "portiere_notturno")) &&
    !done &&
    !waiting;
  const canDelete =
    user.role === "direzione" ||
    user.role === "direttore_congressi" ||
    user.role === "sviluppatore" ||
    user.role === "reception";
  const canOrderPiece =
    (user.role === "manutentore" ||
      user.role === "sviluppatore" ||
      (isAssigned &&
        user.role !== "governante" &&
        user.role !== "portiere_notturno")) &&
    !done &&
    !waiting;
  const canManageWait =
    (user.role === "direzione" ||
      user.role === "direttore_congressi" ||
      user.role === "sviluppatore" ||
      user.role === "reception") &&
    waiting;
  const [showPiece, setShowPiece] = useState(false);
  const [piece, setPiece] = useState(p.pieceName || "");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showRepl, setShowRepl] = useState(false);
  const [repl, setRepl] = useState(p.pieceReplaced || "");
  const fileRef = useRef();
  const mustPhoto = false;
  const pickPhoto = async (e) => {
    const fl = e.target.files?.[0];
    if (!fl) return;
    setBusy(true);
    try {
      setPhoto(await compress(fl));
    } catch {}
    setBusy(false);
  };
  const complete = () => {
    if (mustPhoto && !photo) {
      onFlash("Foto obbligatoria per confermare il lavoro", false);
      return;
    }
    onSave({
      ...p,
      status: "done",
      photoAfter: photo,
      completedBy: user.name,
      completedAt: Date.now(),
    });
    onClose();
    onFlash("Intervento completato ✓");
  };
  const orderPiece = () => {
    if (!piece.trim()) return;
    onSave({
      ...p,
      status: "waiting",
      pieceName: piece.trim(),
      waitingSince: Date.now(),
      waitingBy: user.name,
    });
    onClose();
    onFlash("Pezzo segnalato ✓");
  };
  const pieceArrived = () => {
    onSave({
      ...p,
      status: "pending",
      pieceName: null,
      waitingSince: null,
      waitingBy: null,
      pieceArrivedAt: Date.now(),
    });
    onClose();
    onFlash("Torna in Da fare ✓");
  };
  const saveReplaced = () => {
    if (!repl.trim()) return;
    onSave({
      ...p,
      pieceReplaced: repl.trim(),
      pieceReplacedBy: user.name,
      pieceReplacedAt: Date.now(),
    });
    setShowRepl(false);
    onFlash("Pezzo sostituito registrato ✓");
  };
  const blk = (bg, bc, ch) => (
    <div
      style={{
        background: bg || "#fff",
        border: "1px solid " + (bc || "#E4E0D6"),
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
      }}
    >
      {ch}
    </div>
  );
  const dlbl = (l, c) => (
    <div
      style={{
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: c || "#5C645E",
        fontWeight: 700,
        marginBottom: 6,
      }}
    >
      {l}
    </div>
  );
  return (
    <Sheet onClose={onClose} title={"Camera " + p.room + " · Intervento"}>
      {" "}
      {canDelete && (
        <button
          onClick={() => {
            if (confirm("Eliminare?")) onDelete(p.id);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
            marginBottom: 8,
            background: "#FBE9E6",
            border: "none",
            color: "#B23A2E",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {I.trash} Elimina
        </button>
      )}{" "}
      {blk(
        null,
        null,
        <>
          {" "}
          {dlbl("Dettagli intervento")}{" "}
          {CAT[p.category] && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
                background: CAT[p.category].color + "14",
                color: CAT[p.category].color,
                marginBottom: 8,
              }}
            >
              {I[CAT[p.category].icon]} {CAT[p.category].label}
            </div>
          )}{" "}
          <div style={{ fontSize: 14, lineHeight: 1.45, marginBottom: 8 }}>
            {p.notes || "—"}
          </div>{" "}
          {hasRooms && (
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0E7490" }}>
                  {doneCount} di {p.rooms.length} camere
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#0891B2" }}>
                  {pct}%
                </span>
              </div>
              <div
                style={{
                  height: 9,
                  borderRadius: 5,
                  background: "#E9F3F5",
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: pct + "%",
                    background: "#0891B2",
                    transition: "width .3s",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.rooms.map((r) => {
                  const d = roomsDone[r];
                  return (
                    <button
                      key={r}
                      onClick={() => toggleRoom(r)}
                      title={
                        d
                          ? "Fatta da " + d.by
                          : canTick
                            ? "Tocca per spuntare"
                            : "Solo chi esegue l'intervento puo' spuntare"
                      }
                      style={{
                        minWidth: 54,
                        padding: "9px 6px",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: canTick ? "pointer" : "default",
                        border: "1.5px solid " + (d ? "#0891B2" : "#E4E0D6"),
                        background: d ? "#0891B2" : "#fff",
                        color: d ? "#fff" : "#5C645E",
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              {canTick && doneCount > 0 && (
                <div style={{ fontSize: 11, color: "#5C645E", marginTop: 8 }}>
                  Tocca di nuovo una camera per togliere la spunta.
                </div>
              )}
              {!canTick && !done && (
                <div style={{ fontSize: 11, color: "#5C645E", marginTop: 8 }}>
                  Solo chi esegue l'intervento puo' spuntare le camere.
                </div>
              )}
            </div>
          )}
          <div style={{ fontSize: 11, color: "#5C645E" }}>
            Creato da {p.createdBy} · {fmt(p.createdAt)}
          </div>{" "}
        </>,
      )}{" "}
      {blk(
        "#EFF6FF",
        "#BFDBFE",
        <>
          {" "}
          {dlbl("Data prevista", "#1D4ED8")}{" "}
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1D4ED8",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {" "}
            {I.clock16}{" "}
            {p.scheduledAt ? fmtDate(p.scheduledAt) : "Non impostata"}{" "}
          </div>{" "}
        </>,
      )}{" "}
      {blk(
        null,
        null,
        <>
          {" "}
          {dlbl("Assegnato a")}{" "}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {" "}
            {p.assignees?.map((a, i) => {
              const aWa =
                a.isExt && (a.telefono || "").replace(/[^\d+]/g, "")
                  ? "https://wa.me/" +
                    (a.telefono || "").replace(/[^\d+]/g, "").replace(/^\+/, "")
                  : null;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 11,
                    background: a.isExt ? "#FFFBEB" : "#FBFAF7",
                    border: "1px solid " + (a.isExt ? "#FCD34D" : "#E4E0D6"),
                  }}
                >
                  {" "}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: a.isExt ? "#FEF3C7" : "#0E5C4914",
                      display: "grid",
                      placeItems: "center",
                      color: a.isExt ? "#92400E" : "#0E5C49",
                    }}
                  >
                    {" "}
                    {a.isExt ? I.phone : I[ROLES[a.role]?.icon] || I.users}{" "}
                  </div>{" "}
                  <div style={{ flex: 1 }}>
                    {" "}
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {a.name}
                    </div>{" "}
                    <div style={{ fontSize: 12, color: "#5C645E" }}>
                      {a.isExt ? "Tecnico esterno" : ROLES[a.role]?.label}
                    </div>{" "}
                  </div>{" "}
                  {aWa && (
                    <a
                      href={aWa}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#25D366",
                        color: "#fff",
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        textDecoration: "none",
                      }}
                    >
                      {" "}
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.21-1.1a7.93 7.93 0 0 0 3.8.97h0a7.95 7.95 0 0 0 5.59-13.55zm-5.55 12.2h0a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.6 6.6 0 1 1 12.27-3.5 6.56 6.56 0 0 1-6.68 6.6zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.45.1-.52.64-.64.78-.23.15-.43.05a5.42 5.42 0 0 1-1.6-.98 5.99 5.99 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4s.2-.23.3-.35a1.4 1.4 0 0 0 .2-.33.36.36 0 0 0 0-.35c0-.1-.45-1.08-.62-1.48s-.33-.33-.45-.33-.25 0-.38 0a.74.74 0 0 0-.53.25 2.23 2.23 0 0 0-.7 1.66 3.88 3.88 0 0 0 .82 2.05 8.86 8.86 0 0 0 3.39 3 11.5 11.5 0 0 0 1.13.42 2.7 2.7 0 0 0 1.25.08 2.04 2.04 0 0 0 1.34-.94 1.65 1.65 0 0 0 .12-.94c-.05-.1-.18-.15-.39-.25z" />
                      </svg>{" "}
                    </a>
                  )}{" "}
                  {a.isExt && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 999,
                        background: "#FEF3C7",
                        color: "#92400E",
                      }}
                    >
                      EXT
                    </span>
                  )}{" "}
                </div>
              );
            })}{" "}
          </div>{" "}
        </>,
      )}{" "}
      {/* Attesa pezzo */}{" "}
      {waiting &&
        blk(
          "#EDE9FE18",
          "#C4B5FD",
          <>
            {" "}
            {dlbl("In attesa del pezzo", "#7C3AED")}{" "}
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {p.pieceName}
            </div>{" "}
            <div style={{ fontSize: 11, color: "#5C645E", marginBottom: 10 }}>
              Da {p.waitingBy} · {fmt(p.waitingSince)}
            </div>{" "}
            {p.pieceDecision ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #C4B5FD",
                  borderRadius: 9,
                  padding: "8px 11px",
                  fontSize: 13,
                  color: "#7C3AED",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {" "}
                {I.pkg} <strong>{p.pieceDecisionBy}</strong>{" "}
                {p.pieceDecision === "ritiro"
                  ? "andrà a ritirarlo"
                  : "lo ordinerà"}{" "}
              </div>
            ) : (
              canManageWait && (
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  {" "}
                  <button
                    onClick={() =>
                      onSave({
                        ...p,
                        pieceDecision: "ritiro",
                        pieceDecisionBy: user.name,
                        pieceDecisionAt: Date.now(),
                      })
                    }
                    style={{
                      flex: 1,
                      background: "#7C3AED",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    🚗 Vado a prenderlo
                  </button>{" "}
                  <button
                    onClick={() =>
                      onSave({
                        ...p,
                        pieceDecision: "ordine",
                        pieceDecisionBy: user.name,
                        pieceDecisionAt: Date.now(),
                      })
                    }
                    style={{
                      flex: 1,
                      background: "#fff",
                      color: "#7C3AED",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: "1.5px solid #C4B5FD",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    {I.pkg} Lo ordino
                  </button>{" "}
                </div>
              )
            )}{" "}
            {canManageWait && (
              <button
                onClick={pieceArrived}
                style={{ ...ctaSt, background: "#7C3AED" }}
              >
                {I.pkg} Pezzo arrivato → Da fare
              </button>
            )}{" "}
            {!canManageWait && (
              <div style={{ fontSize: 13, color: "#7C3AED" }}>
                In attesa che la direzione gestisca il pezzo.
              </div>
            )}{" "}
          </>,
        )}{" "}
      {done &&
        blk(
          "#E6F2EB18",
          "#bfe2cf",
          <>
            {" "}
            {dlbl("Completato", "#2E7D5B")}{" "}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
              }}
            >
              {" "}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#2E7D5B22",
                  display: "grid",
                  placeItems: "center",
                  color: "#2E7D5B",
                  flexShrink: 0,
                }}
              >
                {I.check}
              </div>{" "}
              <div>
                {" "}
                <div style={{ fontWeight: 700 }}>{p.completedBy}</div>{" "}
                <div style={{ fontSize: 11, color: "#5C645E" }}>
                  {fmt(p.completedAt)}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {p.photoAfter && (
              <div
                style={{
                  marginTop: 10,
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <img
                  src={p.photoAfter}
                  alt=""
                  onClick={() => onPhoto && onPhoto(p.photoAfter)}
                  style={{
                    width: 110,
                    height: 110,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: "1px solid #E4E0D6",
                    display: "block",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: 10, color: "#5C645E", marginTop: 4 }}>
                  Foto di conferma
                </span>
              </div>
            )}{" "}
          </>,
        )}{" "}
      {p.pieceReplaced &&
        blk(
          "#F5F3FF",
          "#DDD6FE",
          <>
            {dlbl("Pezzo sostituito", "#6D28D9")}
            <div style={{ fontSize: 14, lineHeight: 1.4, marginBottom: 6 }}>
              {p.pieceReplaced}
            </div>
            <div style={{ fontSize: 11, color: "#5C645E" }}>
              Da {p.pieceReplacedBy} · {fmt(p.pieceReplacedAt)}
            </div>
          </>,
        )}{" "}
      {/* Azioni */}{" "}
      {canComplete && (
        <>
          {" "}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={pickPhoto}
          />{" "}
          {photo ? (
            <div
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #E4E0D6",
                marginBottom: 10,
              }}
            >
              <img
                src={photo}
                alt=""
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: 220,
                  objectFit: "cover",
                }}
              />
              <button
                onClick={() => setPhoto(null)}
                style={{
                  position: "absolute",
                  top: 7,
                  right: 7,
                  background: "rgba(0,0,0,.7)",
                  color: "#fff",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {I.x}
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border:
                  "1.5px dashed " +
                  (mustPhoto && !photo ? "#E0A03A" : "#E4E0D6"),
                borderRadius: 12,
                padding: 14,
                textAlign: "center",
                background: mustPhoto && !photo ? "#FFFBEB" : "#FBFAF7",
                cursor: "pointer",
                color: mustPhoto && !photo ? "#92400E" : "#5C645E",
                marginBottom: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              {I.image}
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {busy
                  ? "Elaborazione..."
                  : mustPhoto
                    ? "Foto obbligatoria *"
                    : "Foto (opzionale)"}
              </span>
            </div>
          )}{" "}
          <button
            onClick={complete}
            disabled={busy || (mustPhoto && !photo)}
            style={{
              ...ctaSt,
              background: "#2E7D5B",
              marginBottom: 10,
              opacity: busy || (mustPhoto && !photo) ? 0.5 : 1,
            }}
          >
            {I.check} Segna completato
          </button>{" "}
        </>
      )}{" "}
      {canOrderPiece && !showRepl && (
        <button
          onClick={() => setShowRepl(true)}
          style={{ ...ctaSt, background: "#0E5C49", marginBottom: 10 }}
        >
          {I.pkg} Pezzo sostituito
        </button>
      )}{" "}
      {canOrderPiece && showRepl && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {" "}
          <input
            style={inputSt}
            placeholder="Cosa hai sostituito..."
            value={repl}
            onChange={(e) => setRepl(e.target.value)}
            autoFocus
          />{" "}
          <div style={{ display: "flex", gap: 8 }}>
            {" "}
            <button
              onClick={saveReplaced}
              disabled={!repl.trim()}
              style={{
                ...ctaSt,
                background: "#0E5C49",
                flex: 1,
                opacity: repl.trim() ? 1 : 0.5,
              }}
            >
              {I.check} Conferma
            </button>{" "}
            <button
              onClick={() => setShowRepl(false)}
              style={{
                ...ctaSt,
                background: "#E4E0D6",
                color: "#1B2420",
                flex: "0 0 44px",
              }}
            >
              {I.x}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {canOrderPiece && !showPiece && (
        <button
          onClick={() => setShowPiece(true)}
          style={{ ...ctaSt, background: "#7C3AED" }}
        >
          {I.pkg} Serve un pezzo
        </button>
      )}{" "}
      {canOrderPiece && showPiece && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {" "}
          <input
            style={inputSt}
            placeholder="Nome del pezzo..."
            value={piece}
            onChange={(e) => setPiece(e.target.value)}
            autoFocus
          />{" "}
          <div style={{ display: "flex", gap: 8 }}>
            {" "}
            <button
              onClick={orderPiece}
              disabled={!piece.trim()}
              style={{
                ...ctaSt,
                background: "#7C3AED",
                flex: 1,
                opacity: piece.trim() ? 1 : 0.5,
              }}
            >
              {I.check} Conferma
            </button>{" "}
            <button
              onClick={() => setShowPiece(false)}
              style={{
                ...ctaSt,
                background: "#E4E0D6",
                color: "#1B2420",
                flex: "0 0 44px",
              }}
            >
              {I.x}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {!canComplete && !canOrderPiece && !done && !waiting && (
        <div
          style={{
            background: "#FBF0DC",
            border: "1px solid #efdcb4",
            borderRadius: 11,
            padding: "10px 13px",
            fontSize: 13,
            color: "#7a5212",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {I.clock16} In attesa di completamento.
        </div>
      )}{" "}
    </Sheet>
  );
} // ── NewForm segnalazione ──────────────────────────────────────────────────────
function NewForm({ user, onClose, onSave, zones }) {
  const [room, setRoom] = useState("");
  const [urg, setUrg] = useState("media");
  const [cat, setCat] = useState("varie");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [roomStatus, setRoomStatus] = useState(null);
  const canSetRoomStatus =
    user.role !== "manutentore" && user.role !== "responsabile_area";
  const [camMode, setCamMode] = useState("camera");
  useEffect(() => {
    if (zones && zones.length === 1 && !room) setRoom(zones[0]);
  }, []);
  const f = useRef();
  const pick = async (e) => {
    const fl = e.target.files?.[0];
    if (!fl) return;
    setBusy(true);
    try {
      setPhoto(await compress(fl));
    } catch {}
    setBusy(false);
  };
  const hasZones = zones && zones.length >= 1;
  const roomTrim = room.trim();
  const camCheck = !hasZones && roomTrim ? resolveCamera(roomTrim) : null;
  const camInvalid = !!(camCheck && !camCheck.ok);
  const camResolved = camCheck && camCheck.ok ? camCheck.value : null;
  return (
    <Sheet onClose={onClose} title="Nuova segnalazione">
      {" "}
      <Field label="Numero camera">
        {zones && zones.length === 1 ? (
          <input style={inputSt} value={zones[0]} disabled />
        ) : zones && zones.length > 1 ? (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {zones.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setRoom(z)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #E4E0D6",
                  background: room === z ? "#1B2420" : "#fff",
                  color: room === z ? "#fff" : "#1B2420",
                  fontWeight: 600,
                }}
              >
                {z}
              </button>
            ))}
          </div>
        ) : (
          <>
            <CameraZonaField
              value={room}
              onChange={setRoom}
              autoFocus
              onModeChange={setCamMode}
            />
            {camInvalid && (
              <div style={{ fontSize: 12, color: "#B23A2E", marginTop: 6 }}>
                Numero camera o zona non valida. Controlla il numero o scegli
                una zona nota (es. Hall Jazz, Reception...).
              </div>
            )}
            {camResolved && camResolved !== roomTrim && (
              <div style={{ fontSize: 12, color: "#2E7D5B", marginTop: 6 }}>
                Zona riconosciuta: {camResolved}
              </div>
            )}
          </>
        )}
      </Field>{" "}
      {canSetRoomStatus && camMode === "camera" && (
        <Field label="Stato camera">
          {" "}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}
          >
            {" "}
            {Object.entries(ROOM_ST).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setRoomStatus(roomStatus === k ? null : k)}
                style={{
                  padding: "10px 8px",
                  borderRadius: 11,
                  border:
                    "1.5px solid " + (roomStatus === k ? v.fg : "#E4E0D6"),
                  background: roomStatus === k ? v.bg : "#fff",
                  color: roomStatus === k ? v.fg : "#5C645E",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {v.label}
              </button>
            ))}{" "}
          </div>{" "}
        </Field>
      )}{" "}
      <Field label="Urgenza">
        {" "}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 7,
          }}
        >
          {" "}
          {Object.entries(URG).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setUrg(k)}
              style={{
                padding: "11px 6px",
                borderRadius: 11,
                border: "1.5px solid " + (urg === k ? v.fg : "#E4E0D6"),
                background: urg === k ? v.bg : "#fff",
                color: urg === k ? v.fg : "#5C645E",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {v.label}
            </button>
          ))}{" "}
        </div>{" "}
      </Field>{" "}
      <Field label="Categoria">
        {" "}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {" "}
          {Object.entries(CAT).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setCat(k)}
              style={{
                padding: "9px 12px",
                borderRadius: 11,
                border: "1.5px solid " + (cat === k ? v.color : "#E4E0D6"),
                background: cat === k ? v.color + "14" : "#fff",
                color: cat === k ? v.color : "#5C645E",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {I[v.icon]} {v.label}
            </button>
          ))}{" "}
        </div>{" "}
      </Field>{" "}
      <Field label="Descrizione">
        <textarea
          style={{
            ...inputSt,
            resize: "vertical",
            minHeight: 80,
            lineHeight: 1.5,
          }}
          placeholder="Descrivi il problema..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>{" "}
      <Field label="Foto">
        {" "}
        <input
          ref={f}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={pick}
        />{" "}
        {photo ? (
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #E4E0D6",
            }}
          >
            <img
              src={photo}
              alt=""
              style={{
                width: "100%",
                display: "block",
                maxHeight: 260,
                objectFit: "cover",
              }}
            />
            <button
              onClick={() => setPhoto(null)}
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                background: "rgba(0,0,0,.7)",
                color: "#fff",
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              {I.x}
            </button>
          </div>
        ) : (
          <div
            onClick={() => f.current?.click()}
            style={{
              border: "1.5px dashed #E4E0D6",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
              background: "#FBFAF7",
              cursor: "pointer",
              color: "#5C645E",
            }}
          >
            {busy ? (
              <span>Elaborazione...</span>
            ) : (
              <>
                {I.camera}
                <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600 }}>
                  Scatta o carica
                </div>
              </>
            )}
          </div>
        )}{" "}
      </Field>{" "}
      <button
        style={{
          ...ctaSt,
          background: "#B9842F",
          opacity: !roomTrim || busy || camInvalid ? 0.5 : 1,
        }}
        disabled={!roomTrim || busy || camInvalid}
        onClick={() =>
          onSave({
            id: uid(),
            room: camResolved || roomTrim,
            urgency: urg,
            category: cat,
            notes: notes.trim(),
            roomStatus,
            photoBefore: photo,
            photoAfter: null,
            status: "todo",
            createdBy: user.name,
            createdAt: Date.now(),
            completedBy: null,
            completedAt: null,
          })
        }
      >
        {I.plus} Invia segnalazione
      </button>{" "}
    </Sheet>
  );
} // ── Detail segnalazione ───────────────────────────────────────────────────────
function Detail({
  user,
  it,
  tec,
  onClose,
  onPhoto,
  onSave,
  onDelete,
  onFlash,
}) {
  const u = URG[it.urgency] || URG.media;
  const done = it.status === "done",
    wait = it.status === "waiting",
    needT = it.status === "tecnico",
    active = !done && !wait && !needT;
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [piece, setPiece] = useState(it.pieceName || "");
  const [showW, setShowW] = useState(false);
  const [showT, setShowT] = useState(false);
  const [showRepl, setShowRepl] = useState(false);
  const [repl, setRepl] = useState(it.pieceReplaced || "");
  const [lCalled, setLCalled] = useState(!!it.tecnicoCalledBy);
  const [lCalledAt] = useState(() => Date.now());
  const f = useRef();
  const calledBy = it.tecnicoCalledBy || (lCalled ? user.name : null);
  const calledAt = it.tecnicoCalledAt || (lCalled ? lCalledAt : null);
  const canFix =
    (user.role === "manutentore" ||
      user.role === "sviluppatore" ||
      user.role === "direzione" ||
      user.role === "direttore_congressi" ||
      user.role === "reception") &&
    active;
  const canMW =
    user.role === "direzione" ||
    user.role === "direttore_congressi" ||
    user.role === "sviluppatore" ||
    user.role === "reception";
  const canCall =
    (user.role === "direzione" ||
      user.role === "direttore_congressi" ||
      user.role === "sviluppatore" ||
      user.role === "reception") &&
    needT;
  const canReqT =
    (user.role === "sviluppatore" ||
      user.role === "direzione" ||
      user.role === "direttore_congressi" ||
      user.role === "reception") &&
    active;
  // Il manutentore non chiama piu' un tecnico direttamente: puo' chiedere a
  // chi puo' farlo (reception/direzione/direttore congressi) di occuparsene.
  const canAskTecnico =
    user.role === "manutentore" && active && !it.tecnicoAskedBy;
  const [askingTecnico, setAskingTecnico] = useState(false);
  const askTecnico = async () => {
    setAskingTecnico(true);
    try {
      onSave({
        ...it,
        tecnicoAskedBy: user.name,
        tecnicoAskedAt: Date.now(),
      });
      await fetch(
        "https://jmhzmwyolxzacjunfwcq.supabase.co/functions/v1/send-push",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roles: ["reception", "direzione", "direttore_congressi"],
            title: "🔔 Serve un tecnico",
            body:
              user.name +
              " chiede di contattare un tecnico — Camera " +
              it.room +
              (CAT[it.category] ? " · " + CAT[it.category].label : ""),
          }),
        },
      );
      onFlash("Richiesta inviata a reception/direzione ✓");
    } catch {
      onFlash("Errore nell'invio della richiesta", false);
    }
    setAskingTecnico(false);
  };
  const canOrdP =
    (user.role === "manutentore" || user.role === "sviluppatore") && active;
  const pick = async (e) => {
    const fl = e.target.files?.[0];
    if (!fl) return;
    setBusy(true);
    try {
      setPhoto(await compress(fl));
    } catch {}
    setBusy(false);
  };
  const mustPhoto = false;
  const complete = () => {
    if (mustPhoto && !photo) {
      onFlash("Foto obbligatoria per confermare il lavoro", false);
      return;
    }
    onSave({
      ...it,
      status: "done",
      photoAfter: photo,
      completedBy: user.name,
      completedAt: Date.now(),
    });
    onClose();
    onFlash("Completato ✓");
  };
  const setWait = () => {
    if (!piece.trim()) return;
    onSave({
      ...it,
      status: "waiting",
      pieceName: piece.trim(),
      waitingSince: Date.now(),
      waitingBy: user.name,
    });
    onClose();
    onFlash("Pezzo segnalato ✓");
  };
  const pieceArr = () => {
    onSave({ ...it, status: "todo", pieceArrivedAt: Date.now() });
    onClose();
    onFlash("Torna in Da fare ✓");
  };
  const saveReplaced = () => {
    if (!repl.trim()) return;
    onSave({
      ...it,
      pieceReplaced: repl.trim(),
      pieceReplacedBy: user.name,
      pieceReplacedAt: Date.now(),
    });
    setShowRepl(false);
    onFlash("Pezzo sostituito registrato ✓");
  };
  const reqTec = (t) => {
    onSave({
      ...it,
      status: "tecnico",
      tecnicoId: t.id,
      tecnicoNome: t.nome,
      tecnicoTelefono: t.telefono || "",
      tecnicoRequestedBy: user.name,
      tecnicoRequestedAt: Date.now(),
      tecnicoCalledBy: null,
      tecnicoCalledAt: null,
    });
    setShowT(false);
    onClose();
    onFlash("Tecnico richiesto ✓");
  };
  const waMsg = encodeURIComponent(
    "Ciao " +
      it.tecnicoNome +
      ", c'è un intervento da fare in camera " +
      it.room +
      (CAT[it.category] ? " (" + CAT[it.category].label + ")" : "") +
      ".\n\n" +
      (it.notes ? "Descrizione: " + it.notes + "\n\n" : "") +
      "Urgenza: " +
      (URG[it.urgency]?.label || "") +
      (it.photoBefore ? "\n\n📷 Ti mando subito la foto." : ""),
  );
  const waNum = (it.tecnicoTelefono || "").replace(/[^\d+]/g, "");
  const waLink = waNum
    ? "https://wa.me/" + waNum.replace(/^\+/, "") + "?text=" + waMsg
    : null;
  const markCalled = () => {
    setLCalled(true);
    onSave({ ...it, tecnicoCalledBy: user.name, tecnicoCalledAt: Date.now() });
    onFlash("Chiamata registrata ✓");
  };
  const techDone = () => {
    onSave({
      ...it,
      status: "done",
      completedBy: it.tecnicoNome,
      completedAt: Date.now(),
      tecnicoCompleted: true,
    });
    onClose();
    onFlash("Completato ✓");
  };
  const blk = (bg, bc, ch) => (
    <div
      style={{
        background: bg || "#fff",
        border: "1px solid " + (bc || "#E4E0D6"),
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
      }}
    >
      {ch}
    </div>
  );
  const dlbl = (l, c) => (
    <div
      style={{
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: c || "#5C645E",
        fontWeight: 700,
        marginBottom: 6,
      }}
    >
      {l}
    </div>
  );
  const savePieceDecision = (ans) => {
    onSave({
      ...it,
      pieceDecision: ans,
      pieceDecisionBy: user.name,
      pieceDecisionAt: Date.now(),
    });
    onFlash(ans === "ritiro" ? "Vai a ritirarlo 🚗" : "Verrà ordinato 📦");
  };
  return (
    <Sheet onClose={onClose} title={"Camera " + it.room}>
      {" "}
      {(user.role === "direzione" ||
        user.role === "direttore_congressi" ||
        user.role === "sviluppatore" ||
        user.role === "reception" ||
        ((user.role === "governante" || user.role === "sviluppatore") &&
          it.createdBy === user.name) ||
        ((user.role === "portiere_notturno" || user.role === "sviluppatore") &&
          it.createdBy === user.name) ||
        ((user.role === "responsabile_area" || user.role === "sviluppatore") &&
          it.createdBy === user.name)) && (
        <button
          onClick={() => {
            if (confirm("Eliminare?")) onDelete(it.id);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
            marginBottom: 8,
            background: "#FBE9E6",
            border: "none",
            color: "#B23A2E",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {I.trash} Elimina
        </button>
      )}{" "}
      {blk(
        null,
        null,
        <>
          {dlbl("Problema segnalato")}
          {it.roomStatus && ROOM_ST[it.roomStatus] && (
            <span
              style={{
                display: "inline-block",
                fontSize: 12,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 999,
                background: ROOM_ST[it.roomStatus].bg,
                color: ROOM_ST[it.roomStatus].fg,
                marginBottom: 8,
              }}
            >
              {ROOM_ST[it.roomStatus].label}
            </span>
          )}
          <div style={{ fontSize: 14, lineHeight: 1.45, marginBottom: 8 }}>
            {it.notes || "—"}
          </div>
          <div style={{ fontSize: 11, color: "#5C645E" }}>
            Da {it.createdBy} · {fmt(it.createdAt)}
          </div>
          {it.photoBefore && (
            <div
              style={{
                marginTop: 10,
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <img
                src={it.photoBefore}
                alt=""
                onClick={() => onPhoto(it.photoBefore)}
                style={{
                  width: 110,
                  height: 110,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid #E4E0D6",
                  display: "block",
                  cursor: "pointer",
                }}
              />
              <span style={{ fontSize: 10, color: "#5C645E", marginTop: 4 }}>
                Tocca per ingrandire
              </span>
            </div>
          )}
        </>,
      )}{" "}
      {it.tecnicoAskedBy &&
        it.status === "todo" &&
        blk(
          "#FFFBEB",
          "#FCD34D",
          <>
            {dlbl("Contattare tecnico", "#92400E")}
            <div
              style={{
                fontSize: 13,
                color: "#78350F",
                marginBottom: 6,
                lineHeight: 1.4,
              }}
            >
              {it.tecnicoAskedBy} chiede di contattare un tecnico.
            </div>
            <div style={{ fontSize: 11, color: "#92400E" }}>
              {fmt(it.tecnicoAskedAt)}
            </div>
          </>,
        )}
      {needT &&
        blk(
          "#FFFBEB",
          "#FCD34D",
          <>
            {dlbl("Tecnico contattato", "#92400E")}
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#78350F",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {I.phone} {it.tecnicoNome}
            </div>
            <div style={{ fontSize: 11, color: "#92400E", marginBottom: 10 }}>
              Da {it.tecnicoRequestedBy} · {fmt(it.tecnicoRequestedAt)}
            </div>
            {calledBy ? (
              <>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #FCD34D",
                    borderRadius: 9,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: "#92400E",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {I.check} Chiamato da <strong>{calledBy}</strong> ·{" "}
                  {fmt(calledAt)}
                </div>
                {canCall && (
                  <button
                    onClick={techDone}
                    style={{ ...ctaSt, background: "#2E7D5B" }}
                  >
                    {I.check} Intervento completato
                  </button>
                )}
              </>
            ) : (
              canCall && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {it.photoBefore && (
                    <button
                      onClick={() => onPhoto(it.photoBefore)}
                      style={{
                        ...ctaSt,
                        background: "#fff",
                        color: "#92400E",
                        border: "1.5px solid #FCD34D",
                        fontSize: 13,
                        padding: "10px 6px",
                      }}
                    >
                      {I.image} Apri foto (tieni premuto per salvarla)
                    </button>
                  )}
                  <div style={{ display: "flex", gap: 7 }}>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          background: "#25D366",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 14,
                          padding: 14,
                          borderRadius: 12,
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          textDecoration: "none",
                        }}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.21-1.1a7.93 7.93 0 0 0 3.8.97h0a7.95 7.95 0 0 0 5.59-13.55zm-5.55 12.2h0a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.6 6.6 0 1 1 12.27-3.5 6.56 6.56 0 0 1-6.68 6.6zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.45.1-.52.64-.64.78-.23.15-.43.05a5.42 5.42 0 0 1-1.6-.98 5.99 5.99 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4s.2-.23.3-.35a1.4 1.4 0 0 0 .2-.33.36.36 0 0 0 0-.35c0-.1-.45-1.08-.62-1.48s-.33-.33-.45-.33-.25 0-.38 0a.74.74 0 0 0-.53.25 2.23 2.23 0 0 0-.7 1.66 3.88 3.88 0 0 0 .82 2.05 8.86 8.86 0 0 0 3.39 3 11.5 11.5 0 0 0 1.13.42 2.7 2.7 0 0 0 1.25.08 2.04 2.04 0 0 0 1.34-.94 1.65 1.65 0 0 0 .12-.94c-.05-.1-.18-.15-.39-.25z" />
                        </svg>{" "}
                        Apri chat
                      </a>
                    )}
                    <button
                      onClick={markCalled}
                      style={{ ...ctaSt, background: "#D97706", flex: 1 }}
                    >
                      {I.phone} Ho chiamato
                    </button>
                  </div>
                </div>
              )
            )}
            {!canCall && !calledBy && (
              <div style={{ fontSize: 13, color: "#92400E" }}>
                In attesa che direzione/reception chiami {it.tecnicoNome}.
              </div>
            )}
          </>,
        )}{" "}
      {wait &&
        blk(
          "#EDE9FE18",
          "#C4B5FD",
          <>
            {dlbl("In attesa del pezzo", "#7C3AED")}
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {it.pieceName}
            </div>
            <div style={{ fontSize: 11, color: "#5C645E", marginBottom: 10 }}>
              Da {it.waitingBy} · {fmt(it.waitingSince)}
            </div>
            {it.pieceDecision ? (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #C4B5FD",
                  borderRadius: 9,
                  padding: "8px 11px",
                  fontSize: 13,
                  color: "#7C3AED",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {I.pkg} <strong>{it.pieceDecisionBy}</strong>{" "}
                {it.pieceDecision === "ritiro"
                  ? "andrà a ritirarlo"
                  : "lo ordinerà"}
              </div>
            ) : (
              canMW && (
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button
                    onClick={() => savePieceDecision("ritiro")}
                    style={{
                      flex: 1,
                      background: "#7C3AED",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    🚗 Vado a prenderlo
                  </button>
                  <button
                    onClick={() => savePieceDecision("ordine")}
                    style={{
                      flex: 1,
                      background: "#fff",
                      color: "#7C3AED",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: "1.5px solid #C4B5FD",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    {I.pkg} Lo ordino
                  </button>
                </div>
              )
            )}
            {canMW && (
              <button
                onClick={pieceArr}
                style={{ ...ctaSt, background: "#7C3AED" }}
              >
                {I.pkg} Pezzo arrivato → Da fare
              </button>
            )}
          </>,
        )}{" "}
      {done &&
        blk(
          "#E6F2EB18",
          "#bfe2cf",
          <>
            {dlbl("Completato", "#2E7D5B")}
            <div style={{ fontSize: 13, color: "#5C645E" }}>
              {it.tecnicoCompleted ? (
                <>
                  <strong>{it.tecnicoNome}</strong> (tecnico esterno) ·{" "}
                  {fmt(it.completedAt)}
                </>
              ) : (
                <>
                  Da <strong>{it.completedBy}</strong> · {fmt(it.completedAt)}
                </>
              )}
            </div>
            {it.photoAfter && (
              <div
                style={{
                  marginTop: 10,
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <img
                  src={it.photoAfter}
                  alt=""
                  onClick={() => onPhoto(it.photoAfter)}
                  style={{
                    width: 110,
                    height: 110,
                    objectFit: "cover",
                    borderRadius: 10,
                    border: "1px solid #E4E0D6",
                    display: "block",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: 10, color: "#5C645E", marginTop: 4 }}>
                  Tocca per ingrandire
                </span>
              </div>
            )}
          </>,
        )}
      {it.pieceReplaced &&
        blk(
          "#F5F3FF",
          "#DDD6FE",
          <>
            {dlbl("Pezzo sostituito", "#6D28D9")}
            <div style={{ fontSize: 14, lineHeight: 1.4, marginBottom: 6 }}>
              {it.pieceReplaced}
            </div>
            <div style={{ fontSize: 11, color: "#5C645E" }}>
              Da {it.pieceReplacedBy} · {fmt(it.pieceReplacedAt)}
            </div>
          </>,
        )}{" "}
      {canFix &&
        blk(
          null,
          null,
          <>
            {dlbl("Azioni")}
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#5C645E",
                marginBottom: 8,
              }}
            >
              RIPARAZIONE COMPLETATA
            </div>
            <input
              ref={f}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={pick}
            />
            {photo ? (
              <div
                style={{
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #E4E0D6",
                  marginBottom: 10,
                }}
              >
                <img
                  src={photo}
                  alt=""
                  style={{
                    width: "100%",
                    display: "block",
                    maxHeight: 220,
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => setPhoto(null)}
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    background: "rgba(0,0,0,.7)",
                    color: "#fff",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {I.x}
                </button>
              </div>
            ) : (
              <div
                onClick={() => f.current?.click()}
                style={{
                  border:
                    "1.5px dashed " +
                    (mustPhoto && !photo ? "#E0A03A" : "#E4E0D6"),
                  borderRadius: 12,
                  padding: 14,
                  textAlign: "center",
                  background: mustPhoto && !photo ? "#FFFBEB" : "#FBFAF7",
                  cursor: "pointer",
                  color: mustPhoto && !photo ? "#92400E" : "#5C645E",
                  marginBottom: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {I.image}
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {busy
                    ? "Elaborazione..."
                    : mustPhoto
                      ? "Foto obbligatoria *"
                      : "Foto (opzionale)"}
                </span>
              </div>
            )}
            <button
              onClick={complete}
              disabled={busy || (mustPhoto && !photo)}
              style={{
                ...ctaSt,
                opacity: busy || (mustPhoto && !photo) ? 0.5 : 1,
                marginBottom: 12,
              }}
            >
              {I.check} Segna completata
            </button>
            {!showRepl ? (
              <button
                onClick={() => setShowRepl(true)}
                style={{
                  ...ctaSt,
                  background: "#0E5C49",
                  fontSize: 13,
                  padding: "11px 6px",
                  marginBottom: 12,
                }}
              >
                {I.pkg} Pezzo sostituito
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  marginBottom: 12,
                }}
              >
                <input
                  style={inputSt}
                  placeholder="Cosa hai sostituito..."
                  value={repl}
                  onChange={(e) => setRepl(e.target.value)}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 7 }}>
                  <button
                    onClick={saveReplaced}
                    disabled={!repl.trim()}
                    style={{ ...ctaSt, background: "#0E5C49", flex: 1 }}
                  >
                    {I.check} Salva
                  </button>
                  <button
                    onClick={() => setShowRepl(false)}
                    style={{
                      ...ctaSt,
                      background: "#E4E0D6",
                      color: "#1B2420",
                      flex: "0 0 44px",
                    }}
                  >
                    {I.x}
                  </button>
                </div>
              </div>
            )}
            <div
              style={{ borderTop: "1px solid #E4E0D6", margin: "4px 0 12px" }}
            />
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#5C645E",
                marginBottom: 8,
              }}
            >
              NON RIESCO A RISOLVERE
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 7,
              }}
            >
              {canOrdP &&
                !showT &&
                (!showW ? (
                  <button
                    onClick={() => setShowW(true)}
                    style={{
                      ...ctaSt,
                      background: "#7C3AED",
                      fontSize: 13,
                      padding: "11px 6px",
                    }}
                  >
                    {I.pkg} Serve pezzo
                  </button>
                ) : (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                    }}
                  >
                    <input
                      style={inputSt}
                      placeholder="Nome pezzo..."
                      value={piece}
                      onChange={(e) => setPiece(e.target.value)}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 7 }}>
                      <button
                        onClick={setWait}
                        disabled={!piece.trim()}
                        style={{ ...ctaSt, background: "#7C3AED", flex: 1 }}
                      >
                        {I.check} Conferma
                      </button>
                      <button
                        onClick={() => setShowW(false)}
                        style={{
                          ...ctaSt,
                          background: "#E4E0D6",
                          color: "#1B2420",
                          flex: "0 0 44px",
                        }}
                      >
                        {I.x}
                      </button>
                    </div>
                  </div>
                ))}
              {canAskTecnico && !showW && (
                <button
                  onClick={askTecnico}
                  disabled={askingTecnico}
                  style={{
                    ...ctaSt,
                    background: "#D97706",
                    fontSize: 13,
                    padding: "11px 6px",
                    opacity: askingTecnico ? 0.6 : 1,
                  }}
                >
                  {I.msg} Contatta tecnico
                </button>
              )}
              {canReqT &&
                !showW &&
                (!showT ? (
                  <button
                    onClick={() => setShowT(true)}
                    style={{
                      ...ctaSt,
                      background: "#D97706",
                      fontSize: 13,
                      padding: "11px 6px",
                    }}
                  >
                    {I.phone} Serve tecnico
                  </button>
                ) : (
                  <div
                    style={{
                      gridColumn: "1/-1",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#5C645E" }}>
                      Seleziona tecnico:
                    </div>
                    {tec.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => reqTec(t)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 13px",
                          borderRadius: 12,
                          border: "1.5px solid #E4E0D6",
                          background: "#fff",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {I.phone} {t.nome}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowT(false)}
                      style={{
                        ...ctaSt,
                        background: "#E4E0D6",
                        color: "#1B2420",
                      }}
                    >
                      {I.x} Annulla
                    </button>
                  </div>
                ))}
            </div>
          </>,
        )}{" "}
      {canMW &&
        !done &&
        !wait &&
        !needT &&
        blk(
          null,
          "#C4B5FD",
          <>
            {dlbl("Gestione pezzo", "#7C3AED")}
            {!showW ? (
              <button
                onClick={() => setShowW(true)}
                style={{ ...ctaSt, background: "#7C3AED" }}
              >
                {I.pkg} Ordina un pezzo
              </button>
            ) : (
              <>
                <input
                  style={{ ...inputSt, marginBottom: 9 }}
                  placeholder="Nome pezzo..."
                  value={piece}
                  onChange={(e) => setPiece(e.target.value)}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 7 }}>
                  <button
                    onClick={setWait}
                    disabled={!piece.trim()}
                    style={{ ...ctaSt, background: "#7C3AED", flex: 1 }}
                  >
                    {I.check} Conferma
                  </button>
                  <button
                    onClick={() => setShowW(false)}
                    style={{
                      ...ctaSt,
                      background: "#E4E0D6",
                      color: "#1B2420",
                      flex: "0 0 44px",
                    }}
                  >
                    {I.x}
                  </button>
                </div>
              </>
            )}
          </>,
        )}{" "}
      {!canFix &&
        !done &&
        !wait &&
        !needT &&
        (user.role === "governante" ||
          user.role === "portiere_notturno" ||
          user.role === "sviluppatore" ||
          user.role === "reception") && (
          <div
            style={{
              background: "#FBF0DC",
              border: "1px solid #efdcb4",
              borderRadius: 11,
              padding: "10px 13px",
              fontSize: 13,
              color: "#7a5212",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {I.wrench} In attesa del manutentore.
          </div>
        )}{" "}
    </Sheet>
  );
} // ── Tecnici ───────────────────────────────────────────────────────────────────
function Tecnici({ tec, onSave, onClose }) {
  const [list, setList] = useState(tec);
  const [n, setN] = useState("");
  const [ph, setPh] = useState("");
  const add = () => {
    if (!n.trim()) return;
    const l = [...list, { id: uid(), nome: n.trim(), telefono: ph.trim() }];
    setList(l);
    onSave(l);
    setN("");
    setPh("");
  };
  const rm = (id) => {
    const l = list.filter((t) => t.id !== id);
    setList(l);
    onSave(l);
  };
  const waLink = (t) => {
    const num = (t.telefono || "").replace(/[^\d+]/g, "");
    return num ? "https://wa.me/" + num.replace(/^\+/, "") : null;
  };
  return (
    <Sheet onClose={onClose} title="Rubrica tecnici">
      {" "}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {" "}
        {list.map((t) => {
          const link = waLink(t);
          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "1px solid #E4E0D6",
                borderRadius: 11,
                padding: "11px 13px",
              }}
            >
              {" "}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "#FEF3C7",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {I.phone}
              </div>{" "}
              <div style={{ flex: 1, minWidth: 0 }}>
                {" "}
                <div style={{ fontWeight: 600 }}>{t.nome}</div>{" "}
                {t.telefono && (
                  <div style={{ fontSize: 12, color: "#5C645E" }}>
                    {t.telefono}
                  </div>
                )}{" "}
              </div>{" "}
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#E6F2EB",
                    border: "none",
                    color: "#2E7D5B",
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  {" "}
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.21-1.1a7.93 7.93 0 0 0 3.8.97h0a7.95 7.95 0 0 0 5.59-13.55zm-5.55 12.2h0a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.44-.16-.25a6.6 6.6 0 1 1 12.27-3.5 6.56 6.56 0 0 1-6.68 6.6zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.45.1-.52.64-.64.78-.23.15-.43.05a5.42 5.42 0 0 1-1.6-.98 5.99 5.99 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4s.2-.23.3-.35a1.4 1.4 0 0 0 .2-.33.36.36 0 0 0 0-.35c0-.1-.45-1.08-.62-1.48s-.33-.33-.45-.33-.25 0-.38 0a.74.74 0 0 0-.53.25 2.23 2.23 0 0 0-.7 1.66 3.88 3.88 0 0 0 .82 2.05 8.86 8.86 0 0 0 3.39 3 11.5 11.5 0 0 0 1.13.42 2.7 2.7 0 0 0 1.25.08 2.04 2.04 0 0 0 1.34-.94 1.65 1.65 0 0 0 .12-.94c-.05-.1-.18-.15-.39-.25z" />
                  </svg>{" "}
                </a>
              )}{" "}
              <button
                onClick={() => rm(t.id)}
                style={{
                  background: "#FBE9E6",
                  border: "none",
                  color: "#B23A2E",
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {I.trash}
              </button>{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {" "}
        <input
          style={inputSt}
          placeholder="Nome tecnico"
          value={n}
          onChange={(e) => setN(e.target.value)}
        />{" "}
        <input
          style={inputSt}
          placeholder="Numero WhatsApp (es. 3331234567)"
          inputMode="tel"
          value={ph}
          onChange={(e) => setPh(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />{" "}
        <button
          onClick={add}
          disabled={!n.trim()}
          style={{
            ...ctaSt,
            background: "#0E5C49",
            opacity: n.trim() ? 1 : 0.5,
          }}
        >
          {I.userplus} Aggiungi tecnico
        </button>{" "}
      </div>{" "}
    </Sheet>
  );
} // ── ChangePIN ─────────────────────────────────────────────────────────────────
function ChangePIN({ user, onClose, onFlash }) {
  const [old, setOld] = useState("");
  const [np, setNp] = useState("");
  const [np2, setNp2] = useState("");
  const [err, setErr] = useState("");
  const save = async () => {
    if (np !== np2) {
      setErr("I PIN non coincidono");
      return;
    }
    const users = await DB.loadUsers();
    const found = users.find(
      (u) =>
        u.name.trim().toLowerCase() === user.name.trim().toLowerCase() &&
        u.role === user.role,
    );
    if (!found) {
      setErr("Utente non trovato");
      return;
    }
    if (found.pin !== old) {
      setErr("PIN attuale errato");
      setOld("");
      return;
    }
    await DB.updateUserPin(user.name, user.role, np);
    onFlash("PIN aggiornato ✓");
    onClose();
  };
  const pIn = (val, set) => (
    <input
      style={{
        ...inputSt,
        textAlign: "center",
        fontSize: 20,
        letterSpacing: 8,
      }}
      type="password"
      inputMode="numeric"
      maxLength={4}
      placeholder="••••"
      value={val}
      onChange={(e) => set(e.target.value.replace(/\D/g, "").slice(0, 4))}
    />
  );
  return (
    <Sheet onClose={onClose} title="Cambia il tuo PIN">
      <Field label="PIN attuale">{pIn(old, setOld)}</Field>
      <Field label="Nuovo PIN">
        {pIn(np, (v) => {
          setNp(v);
          setErr("");
        })}
      </Field>
      <Field label="Conferma nuovo PIN">
        {pIn(np2, (v) => {
          setNp2(v);
          setErr("");
        })}
      </Field>
      {err && (
        <div style={{ color: "#B23A2E", fontSize: 13, marginBottom: 10 }}>
          {err}
        </div>
      )}
      <button
        onClick={save}
        disabled={old.length !== 4 || np.length !== 4 || np2.length !== 4}
        style={{
          ...ctaSt,
          opacity:
            old.length !== 4 || np.length !== 4 || np2.length !== 4 ? 0.5 : 1,
        }}
      >
        {I.check} Salva PIN
      </button>
    </Sheet>
  );
} // ── Feedback ─────────────────────────────────────────────────────────────────
function FeedbackForm({ user, onClose, onFlash }) {
  const FEEDBACK_URL =
    "https://script.google.com/macros/s/AKfycbxjJ1xmM72aDIdoqBk3nC2_Hz_g6YvCcu5uhUkb2hj9it8xr9k0gXKQ33AtEXQpoIrg/exec";
  const ruoloLabel = roleDisplayFor(user.role, user.zones)?.label || user.role;
  const [oggetto, setOggetto] = useState("");
  const [testo, setTesto] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const f = useRef();
  const pick = async (e) => {
    const fl = e.target.files?.[0];
    if (!fl) return;
    setBusy(true);
    try {
      setPhoto(await compress(fl));
    } catch {}
    setBusy(false);
  };
  const send = async () => {
    if (!oggetto.trim() || !testo.trim() || sending) return;
    setSending(true);
    try {
      await fetch(FEEDBACK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          tipo: "feedback",
          ruolo: ruoloLabel,
          utente: user.name,
          oggetto: oggetto.trim(),
          testo: testo.trim(),
          foto: photo || "",
        }),
      });
      onFlash("Feedback inviato, grazie! ✓");
      onClose();
    } catch {
      onFlash("Errore durante l'invio del feedback", false);
    }
    setSending(false);
  };
  return (
    <Sheet onClose={onClose} title="Invia un feedback">
      {" "}
      <Field label="Ruolo">
        <input style={inputSt} value={ruoloLabel} disabled />
      </Field>{" "}
      <Field label="Oggetto *">
        <input
          style={inputSt}
          maxLength={150}
          placeholder="Es. Problema con il filtro segnalazioni"
          value={oggetto}
          onChange={(e) => setOggetto(e.target.value)}
        />
      </Field>{" "}
      <Field label="Messaggio *">
        <textarea
          style={{
            ...inputSt,
            resize: "vertical",
            minHeight: 120,
            lineHeight: 1.5,
          }}
          maxLength={3000}
          placeholder="Descrivi il problema o il suggerimento..."
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
        />
      </Field>{" "}
      <Field label="Foto (opzionale)">
        {" "}
        <input
          ref={f}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={pick}
        />{" "}
        {photo ? (
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #E4E0D6",
            }}
          >
            <img
              src={photo}
              alt=""
              style={{
                width: "100%",
                display: "block",
                maxHeight: 260,
                objectFit: "cover",
              }}
            />
            <button
              onClick={() => setPhoto(null)}
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                background: "rgba(0,0,0,.7)",
                color: "#fff",
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              {I.x}
            </button>
          </div>
        ) : (
          <div
            onClick={() => f.current?.click()}
            style={{
              border: "1.5px dashed #E4E0D6",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
              background: "#FBFAF7",
              cursor: "pointer",
              color: "#5C645E",
            }}
          >
            {busy ? (
              <span>Elaborazione...</span>
            ) : (
              <>
                {I.camera}
                <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600 }}>
                  Scatta o carica
                </div>
              </>
            )}
          </div>
        )}{" "}
      </Field>{" "}
      <button
        onClick={send}
        disabled={!oggetto.trim() || !testo.trim() || sending || busy}
        style={{
          ...ctaSt,
          opacity:
            !oggetto.trim() || !testo.trim() || sending || busy ? 0.5 : 1,
        }}
      >
        {I.check} {sending ? "Invio..." : "Invia feedback"}
      </button>{" "}
    </Sheet>
  );
} // ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [matchedUser, setMatchedUser] = useState(null);
  const [adminPin, setAdminPin] = useState(
    () => ST.get("adminpin") || ADMIN_PIN_DEFAULT,
  );
  const [users, setUsers] = useState([]);
  const [step, setStep] = useState("login");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [sugg, setSugg] = useState([]);
  useEffect(() => {
    DB.loadUsers().then((u) => setUsers(u.length ? u : []));
  }, []);
  const onName = (v) => {
    setName(v);
    setMatchedUser(null);
    setSugg(
      v.trim()
        ? users.filter((u) => u.name.toLowerCase().startsWith(v.toLowerCase()))
        : [],
    );
  };
  const pickSugg = (u) => {
    setName(u.name);
    setMatchedUser(u);
    setSugg([]);
  };
  const goPin = () => {
    if (!name.trim()) return;
    const exact = users.find(
      (u) => u.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    if (!exact) {
      setErr("Utente non trovato. Contatta l'admin.");
      return;
    }
    setMatchedUser(exact);
    setSugg([]);
    setPin("");
    setErr("");
    setStep("pin");
  };
  const handlePin = () => {
    if (!matchedUser) {
      setErr("Utente non trovato. Contatta l'admin.");
      setPin("");
      return;
    }
    if (pin === matchedUser.pin)
      onLogin(matchedUser.role, matchedUser.name, matchedUser.mustChangePin);
    else {
      setErr("PIN errato");
      setPin("");
    }
  };
  const handleAdminPin = () => {
    if (pin === adminPin) {
      setStep("admin");
      setPin("");
      setErr("");
    } else {
      setErr("PIN errato");
      setPin("");
    }
  };
  const pinScreen = (title, sub, handler) => (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background:
          "radial-gradient(110% 80% at 50% -10%, #1a7a5f 0%, #0e5c49 35%, #083d31 70%, #052821 100%)",
        fontFamily: "ui-sans-serif,system-ui,sans-serif",
        overflow: "hidden",
      }}
    >
      {" "}
      <div
        style={{
          position: "absolute",
          top: "-12%",
          left: "-18%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(94,213,178,.28), transparent 65%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "absolute",
          bottom: "-18%",
          right: "-15%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(14,92,73,.45), transparent 70%)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "8%",
          width: 140,
          height: 140,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          minHeight: 480,
          background: "#fff",
          borderRadius: 22,
          padding: "32px 22px",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,.5)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {" "}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 13,
              background: "#0E5C49",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 12px",
              color: "#fff",
            }}
          >
            {I.lock}
          </div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{title}</div>
          <div style={{ fontSize: 13, color: "#5C645E", marginTop: 3 }}>
            {sub}
          </div>
        </div>{" "}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: pin.length > i ? "#0E5C49" : "#E4E0D6",
                transition: "background .15s",
              }}
            />
          ))}
        </div>{" "}
        <input
          style={{
            ...inputSt,
            textAlign: "center",
            fontSize: 24,
            letterSpacing: 8,
            marginBottom: 8,
          }}
          type="password"
          inputMode="numeric"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
            setErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && handler()}
          autoFocus
        />{" "}
        {err && (
          <div
            style={{
              color: "#B23A2E",
              fontSize: 13,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            {err}
          </div>
        )}{" "}
        <button
          onClick={handler}
          disabled={pin.length !== 4}
          style={{
            ...ctaSt,
            opacity: pin.length !== 4 ? 0.5 : 1,
            marginBottom: 10,
          }}
        >
          {I.check} Entra
        </button>{" "}
        <button
          onClick={() => {
            setStep("login");
            setPin("");
            setErr("");
          }}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "#5C645E",
            fontSize: 13,
            cursor: "pointer",
            padding: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {I.back} Torna indietro
        </button>{" "}
      </div>{" "}
    </div>
  );
  if (step === "admin")
    return (
      <AdminPanel
        adminPin={adminPin}
        onSaveAdminPin={(p) => {
          setAdminPin(p);
          ST.set("adminpin", p);
        }}
        onSaveUsers={(u) => {
          // AdminPanel ha gia' scritto sul database (in modo mirato per
          // aggiunte/rimozioni, o con sostituzione completa per import/backup
          // dove e' l'operazione voluta): qui serve solo aggiornare la copia
          // locale, senza riscrivere di nuovo tutta la tabella.
          setUsers(u);
        }}
        onBack={() => setStep("login")}
      />
    );
  if (step === "pin")
    return pinScreen("Ciao, " + name, "Inserisci il tuo PIN", handlePin);
  if (step === "admin-pin")
    return pinScreen("Accesso Admin", "PIN admin", handleAdminPin);
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background:
          "radial-gradient(110% 80% at 50% -10%, #1a7a5f 0%, #0e5c49 35%, #083d31 70%, #052821 100%)",
        fontFamily: "ui-sans-serif,system-ui,sans-serif",
        overflow: "hidden",
      }}
    >
      {" "}
      <div
        style={{
          position: "absolute",
          top: "-12%",
          left: "-18%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(94,213,178,.28), transparent 65%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "absolute",
          bottom: "-18%",
          right: "-15%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(14,92,73,.45), transparent 70%)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "8%",
          width: 140,
          height: 140,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />{" "}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          minHeight: 480,
          background: "#fff",
          borderRadius: 22,
          padding: "32px 22px",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,.5)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {" "}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 4,
          }}
        >
          {" "}
          <button
            onClick={() => {
              setPin("");
              setErr("");
              setStep("admin-pin");
            }}
            style={{
              background: "rgba(14,92,73,.08)",
              border: "none",
              color: "#0E5C49",
              width: 34,
              height: 34,
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            {I.menu}
          </button>{" "}
        </div>{" "}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          {" "}
          <img
            src={HOTEL_LOGO}
            alt="Hotel Giò"
            style={{
              width: 120,
              borderRadius: 14,
              boxShadow: "0 8px 24px -8px rgba(0,0,0,.25)",
            }}
          />{" "}
        </div>{" "}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {" "}
          <div style={{ fontWeight: 800, fontSize: 17 }}>
            Manutenzioni - Hotel Jazz & Wine
          </div>{" "}
        </div>{" "}
        <div style={{ marginBottom: 6, position: "relative" }}>
          {" "}
          <input
            style={inputSt}
            placeholder="Il tuo nome"
            value={name}
            onChange={(e) => onName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && goPin()}
            autoFocus
          />{" "}
          {sugg.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #E4E0D6",
                borderRadius: 11,
                marginTop: 4,
                zIndex: 10,
                overflow: "hidden",
                boxShadow: "0 8px 24px -8px rgba(0,0,0,.15)",
              }}
            >
              {" "}
              {sugg.map((u) => (
                <div
                  key={u.id}
                  onClick={() => pickSugg(u)}
                  style={{
                    padding: "11px 14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderBottom: "1px solid #E4E0D6",
                  }}
                >
                  {" "}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#0E5C4914",
                      display: "grid",
                      placeItems: "center",
                      color: "#0E5C49",
                    }}
                  >
                    {I[ROLES[u.role]?.icon]}
                  </div>{" "}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#5C645E" }}>
                      {ROLES[u.role]?.label}
                    </div>
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
        {err && (
          <div style={{ color: "#B23A2E", fontSize: 13, marginBottom: 10 }}>
            {err}
          </div>
        )}{" "}
        <button
          onClick={goPin}
          disabled={!name.trim()}
          style={{ ...ctaSt, opacity: !name.trim() ? 0.5 : 1, marginTop: 12 }}
        >
          Continua →
        </button>{" "}
      </div>{" "}
    </div>
  );
} // ── AdminPanel ────────────────────────────────────────────────────────────────
function AdminPanel({ adminPin, onSaveAdminPin, onSaveUsers, onBack }) {
  const [users, setUsers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("manutentore");
  const [newPin, setNewPin] = useState("");
  const [areaSubtype, setAreaSubtype] = useState(null);
  const [newAreaZones, setNewAreaZones] = useState("");
  const [newAPin, setNewAPin] = useState("");
  const [devPin, setDevPin] = useState("");
  const [devErr, setDevErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const fileRef = useRef();
  useEffect(() => {
    DB.loadUsers().then((u) => setUsers(u));
  }, []);
  const saveU = async (u) => {
    setUsers(u);
    await DB.saveUsers(u);
    onSaveUsers && onSaveUsers(u);
  };
  const add = () => {
    if (!newName.trim() || newPin.length !== 4) return;
    if (newRole === "sviluppatore" && devPin !== "1911") {
      setDevErr(
        "PIN di verifica errato. Assegnazione ruolo Sviluppatore bloccata.",
      );
      return;
    }
    const zonesArr =
      newRole === "responsabile_area"
        ? newAreaZones
            .split(",")
            .map((z) => z.trim())
            .filter(Boolean)
        : null;
    const nu = { id: uid(), name: newName.trim(), role: newRole, pin: newPin };
    if (zonesArr && zonesArr.length) nu.zones = zonesArr;
    // scrittura mirata: aggiunge solo questo utente, non riscrive tutta la
    // tabella (altrimenti si rischia di sovrascrivere PIN cambiati da altri
    // nel frattempo con la lista "vecchia" caricata all'apertura del pannello)
    DB.addUser(nu);
    const u = [...users, nu];
    setUsers(u);
    onSaveUsers && onSaveUsers(u);
    setShowForm(false);
    setNewName("");
    setNewPin("");
    setAreaSubtype(null);
    setNewAreaZones("");
    setDevPin("");
    setDevErr("");
  };
  const rm = (id) => {
    // scrittura mirata: elimina solo questo utente, stesso motivo di add()
    DB.deleteUser(id);
    const u = users.filter((x) => x.id !== id);
    setUsers(u);
    onSaveUsers && onSaveUsers(u);
  };
  const [syncMsg, setSyncMsg] = useState(null);
  const syncDefaults = () => {
    const missing = DEF_USERS.filter(
      (d) =>
        !users.some(
          (u) =>
            u.name.trim().toLowerCase() === d.name.trim().toLowerCase() &&
            u.role === d.role,
        ),
    );
    if (missing.length === 0) {
      setSyncMsg({ ok: true, m: "Già tutti presenti, nessuno aggiunto." });
    } else {
      // scrittura mirata: aggiunge solo gli utenti mancanti, senza toccare
      // gli altri (stesso motivo di add()/rm(): evita di sovrascrivere PIN
      // cambiati nel frattempo con la lista "vecchia" caricata all'apertura)
      missing.forEach((m) => DB.addUser(m));
      const u = [...users, ...missing];
      setUsers(u);
      onSaveUsers && onSaveUsers(u);
      setSyncMsg({
        ok: true,
        m: "Aggiunti: " + missing.map((m) => m.name).join(", "),
      });
    }
    setTimeout(() => setSyncMsg(null), 4000);
  };
  const exportBackup = async () => {
    const tecnici = await DB.loadTecnici();
    const data = {
      users,
      tecnici,
      adminpin: adminPin,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "backup_dipendenti_" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.users)) throw new Error("formato non valido");
        await saveU(data.users);
        if (Array.isArray(data.tecnici)) await DB.saveTecnici(data.tecnici);
        if (data.adminpin) onSaveAdminPin(data.adminpin);
        setImportMsg({
          ok: true,
          m:
            "Backup ripristinato: " +
            data.users.length +
            " utenti, " +
            (data.tecnici?.length || 0) +
            " tecnici.",
        });
      } catch (err) {
        setImportMsg({ ok: false, m: "File non valido." });
      }
      setTimeout(() => setImportMsg(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4F2ED",
        fontFamily: "ui-sans-serif,system-ui,sans-serif",
      }}
    >
      {" "}
      <div
        style={{
          background: "#0E5C49",
          color: "#fff",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          position: "sticky",
          top: 0,
        }}
      >
        {" "}
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,.15)",
            border: "none",
            color: "#fff",
            width: 34,
            height: 34,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          {I.back}
        </button>{" "}
        <span style={{ fontWeight: 700, fontSize: 16 }}>
          Pannello Admin
        </span>{" "}
      </div>{" "}
      <div style={{ maxWidth: 460, margin: "0 auto", padding: 16 }}>
        {" "}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#5C645E",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 10,
          }}
        >
          Utenti
        </div>{" "}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {" "}
          {users.length === 0 && (
            <div
              style={{
                fontSize: 13,
                color: "#5C645E",
                textAlign: "center",
                padding: "16px 0",
              }}
            >
              Nessun utente ancora.
            </div>
          )}{" "}
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "1px solid #E4E0D6",
                borderRadius: 11,
                padding: "11px 13px",
              }}
            >
              {" "}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "#0E5C4914",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  color: "#0E5C49",
                }}
              >
                {I[roleDisplayFor(u.role, u.zones).icon]}
              </div>{" "}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: "#5C645E" }}>
                  {roleDisplayFor(u.role, u.zones).label}
                </div>
              </div>{" "}
              <button
                onClick={() => rm(u.id)}
                style={{
                  background: "#FBE9E6",
                  border: "none",
                  borderRadius: 7,
                  width: 30,
                  height: 30,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  color: "#B23A2E",
                }}
              >
                {I.trash}
              </button>{" "}
            </div>
          ))}{" "}
        </div>{" "}
        {showForm ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E4E0D6",
              borderRadius: 14,
              padding: 14,
              marginBottom: 14,
            }}
          >
            {" "}
            <div style={{ fontWeight: 700, marginBottom: 12 }}>
              Nuovo utente
            </div>{" "}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Nome
              </label>
              <input
                style={inputSt}
                placeholder="es. Marco"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>{" "}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Ruolo
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 7,
                }}
              >
                {[
                  ...Object.entries(ROLES).filter(
                    ([k]) => k !== "responsabile_area",
                  ),
                  ["ristorante", { label: "Ristorante", icon: "wine" }],
                  ["colazioni", { label: "Colazioni", icon: "coffee" }],
                ].map(([k, r]) => {
                  const sel =
                    k === "ristorante"
                      ? areaSubtype === "ristorante"
                      : k === "colazioni"
                        ? areaSubtype === "colazioni"
                        : newRole === k;
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        if (k === "ristorante") {
                          setNewRole("responsabile_area");
                          setAreaSubtype("ristorante");
                          setNewAreaZones("Risto Wine, Risto Jazz");
                        } else if (k === "colazioni") {
                          setNewRole("responsabile_area");
                          setAreaSubtype("colazioni");
                          setNewAreaZones("Sala Colazioni");
                        } else {
                          setNewRole(k);
                          setAreaSubtype(null);
                        }
                      }}
                      style={{
                        padding: "10px 6px",
                        borderRadius: 10,
                        border: "1.5px solid " + (sel ? "#0E5C49" : "#E4E0D6"),
                        background: sel ? "#0E5C4914" : "#fff",
                        fontWeight: 600,
                        fontSize: 12,
                        color: sel ? "#0E5C49" : "#5C645E",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      {I[r.icon]} {r.label}
                    </button>
                  );
                })}
              </div>
            </div>{" "}
            {newRole === "sviluppatore" && (
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  PIN di verifica (Sviluppatore)
                </label>
                <input
                  style={{
                    ...inputSt,
                    textAlign: "center",
                    fontSize: 20,
                    letterSpacing: 8,
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="****"
                  value={devPin}
                  onChange={(e) => {
                    setDevPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                    setDevErr("");
                  }}
                />
                {devErr && (
                  <div style={{ color: "#B23A2E", fontSize: 12, marginTop: 6 }}>
                    {devErr}
                  </div>
                )}
              </div>
            )}
            {areaSubtype && (
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Zone consentite
                </label>
                <input
                  style={inputSt}
                  placeholder="es. Risto Wine, Risto Jazz"
                  value={newAreaZones}
                  onChange={(e) => setNewAreaZones(e.target.value)}
                />
              </div>
            )}{" "}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                PIN
              </label>
              <input
                style={{
                  ...inputSt,
                  textAlign: "center",
                  fontSize: 20,
                  letterSpacing: 8,
                }}
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={newPin}
                onChange={(e) =>
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
              />
            </div>{" "}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={add}
                disabled={
                  !newName.trim() ||
                  newPin.length !== 4 ||
                  (newRole === "sviluppatore" && devPin !== "1911")
                }
                style={{
                  ...ctaSt,
                  flex: 1,
                  opacity:
                    !newName.trim() ||
                    newPin.length !== 4 ||
                    (newRole === "sviluppatore" && devPin !== "1911")
                      ? 0.5
                      : 1,
                }}
              >
                {I.check} Crea
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  ...ctaSt,
                  flex: "0 0 44px",
                  background: "#E4E0D6",
                  color: "#1B2420",
                }}
              >
                {I.x}
              </button>
            </div>{" "}
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{ ...ctaSt, marginBottom: 14 }}
          >
            {I.plus} Aggiungi utente
          </button>
        )}{" "}
        <button
          onClick={syncDefaults}
          style={{
            ...ctaSt,
            background: "#fff",
            color: "#0E5C49",
            border: "1.5px solid #0E5C49",
            marginBottom: 8,
          }}
        >
          {I.refresh} Sincronizza utenti default
        </button>{" "}
        {syncMsg && (
          <div
            style={{
              marginBottom: 14,
              background: "#E6F2EB",
              border: "1px solid #bfe2cf",
              borderRadius: 9,
              padding: "9px 12px",
              fontSize: 13,
              color: "#2E7D5B",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {I.check} {syncMsg.m}
          </div>
        )}{" "}
        {!syncMsg && <div style={{ marginBottom: 14 }} />}{" "}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#5C645E",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 10,
          }}
        >
          PIN Admin
        </div>{" "}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E4E0D6",
            borderRadius: 14,
            padding: 14,
            marginBottom: 14,
          }}
        >
          {" "}
          <div style={{ fontSize: 13, color: "#5C645E", marginBottom: 10 }}>
            Modifica il PIN admin
          </div>{" "}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{
                ...inputSt,
                flex: 1,
                textAlign: "center",
                fontSize: 20,
                letterSpacing: 8,
              }}
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Nuovo PIN"
              value={newAPin}
              onChange={(e) =>
                setNewAPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
            />
            <button
              onClick={() => {
                if (newAPin.length !== 4) return;
                onSaveAdminPin(newAPin);
                setNewAPin("");
              }}
              disabled={newAPin.length !== 4}
              style={{
                ...ctaSt,
                flex: "0 0 54px",
                opacity: newAPin.length !== 4 ? 0.5 : 1,
              }}
            >
              {I.check}
            </button>
          </div>{" "}
        </div>{" "}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#5C645E",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 10,
          }}
        >
          Backup &amp; Ripristino
        </div>{" "}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E4E0D6",
            borderRadius: 14,
            padding: 14,
          }}
        >
          {" "}
          <div style={{ fontSize: 13, color: "#5C645E", marginBottom: 12 }}>
            Salva o ripristina dipendenti, PIN e tecnici (utile finché l'app
            gira in modalità anteprima).
          </div>{" "}
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={importBackup}
          />{" "}
          <div style={{ display: "flex", gap: 8 }}>
            {" "}
            <button
              onClick={exportBackup}
              style={{ ...ctaSt, flex: 1, background: "#0E5C49" }}
            >
              {I.download} Esporta backup
            </button>{" "}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                ...ctaSt,
                flex: 1,
                background: "#fff",
                color: "#0E5C49",
                border: "1.5px solid #0E5C49",
              }}
            >
              {I.userplus} Ripristina
            </button>{" "}
          </div>{" "}
          {importMsg && (
            <div
              style={{
                marginTop: 10,
                background: importMsg.ok ? "#E6F2EB" : "#FBE9E6",
                border: "1px solid " + (importMsg.ok ? "#bfe2cf" : "#f0ccc6"),
                borderRadius: 9,
                padding: "9px 12px",
                fontSize: 13,
                color: importMsg.ok ? "#2E7D5B" : "#B23A2E",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {importMsg.ok ? I.check : I.x} {importMsg.m}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
} // ── Bottone I miei lavori nel menu ───────────────────────────────────────────
function MyWorkBtn({ user, items, planned, onOpen }) {
  const myDone = items.filter(
    (i) =>
      i.status === "done" &&
      (i.completedBy === user.name || i.tecnicoNome === user.name),
  );
  const myPlanned = planned.filter((p) =>
    p.assignees?.some(
      (a) => a.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
    ),
  );
  const tot = myDone.length + myPlanned.length;
  if (tot === 0) return null;
  return (
    <button
      onClick={onOpen}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 20px",
        background: "none",
        border: "none",
        borderTop: "1px solid #F4F2ED",
        borderBottom: "1px solid #F4F2ED",
        cursor: "pointer",
        color: "#1B2420",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {" "}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "#E6F2EB",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          color: "#2E7D5B",
        }}
      >
        {" "}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>{" "}
      </div>{" "}
      <span style={{ flex: 1, textAlign: "left" }}>I miei lavori</span>{" "}
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          background: "#E6F2EB",
          color: "#2E7D5B",
          borderRadius: 999,
          padding: "2px 8px",
        }}
      >
        {tot}
      </span>{" "}
    </button>
  );
} // ── I miei lavori (pagina dedicata) ──────────────────────────────────────────
function MyWorkPage({ user, items, planned, onClose, onOpen }) {
  const myDone = items
    .filter(
      (i) =>
        i.status === "done" &&
        (i.completedBy === user.name || i.tecnicoNome === user.name),
    )
    .sort((a, b) => b.completedAt - a.completedAt);
  const myPlanned = planned
    .filter((p) =>
      p.assignees?.some(
        (a) => a.name.trim().toLowerCase() === user.name.trim().toLowerCase(),
      ),
    )
    .sort((a, b) => (b.scheduledAt || 0) - (a.scheduledAt || 0));
  const myPlannedDone = myPlanned.filter((p) => p.status === "done");
  const myPlannedPending = myPlanned.filter(
    (p) => p.status === "pending" || p.status === "waiting",
  );
  const [search, setSearch] = useState("");
  const q = search.toLowerCase();
  const filtDone = myDone.filter(
    (i) =>
      !q ||
      String(i.room).includes(q) ||
      (i.notes || "").toLowerCase().includes(q),
  );
  const filtPDone = myPlannedDone.filter(
    (p) =>
      !q ||
      String(p.room).includes(q) ||
      (p.notes || "").toLowerCase().includes(q),
  );
  const filtPPend = myPlannedPending.filter(
    (p) =>
      !q ||
      String(p.room).includes(q) ||
      (p.notes || "").toLowerCase().includes(q),
  );
  const fmt2 = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return (
      d.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " · " +
      d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
    );
  };
  const SectionLabel = ({ label, count }) => (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#5C645E",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        margin: "18px 0 8px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {" "}
      {label}{" "}
      <span
        style={{
          background: "#F4F2ED",
          borderRadius: 999,
          padding: "1px 8px",
          fontSize: 11,
        }}
      >
        {count}
      </span>{" "}
    </div>
  );
  const PlanCard = ({ p }) => (
    <div
      onClick={() => onOpen({ pd: p })}
      style={{
        background: "#fff",
        border: "1.5px solid " + (p.status === "done" ? "#bfe2cf" : "#BFDBFE"),
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      {" "}
      <div
        style={{
          width: 6,
          background: p.status === "done" ? "#2E7D5B" : "#1D4ED8",
          flexShrink: 0,
        }}
      />{" "}
      <div style={{ padding: "12px 14px", flex: 1 }}>
        {" "}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          {" "}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 11,
              background: p.status === "done" ? "#E6F2EB" : "#EFF6FF",
              border:
                "1px solid " + (p.status === "done" ? "#bfe2cf" : "#BFDBFE"),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {" "}
            <div
              style={{
                fontSize: 7,
                color: p.status === "done" ? "#2E7D5B" : "#1D4ED8",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Cam.
            </div>{" "}
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                lineHeight: 1,
                color: p.status === "done" ? "#2E7D5B" : "#1D4ED8",
              }}
            >
              {p.room}
            </div>{" "}
          </div>{" "}
          <div style={{ flex: 1, minWidth: 0 }}>
            {" "}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 4,
                flexWrap: "wrap",
              }}
            >
              {" "}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: p.status === "done" ? "#E6F2EB" : "#EFF6FF",
                  color: p.status === "done" ? "#2E7D5B" : "#1D4ED8",
                }}
              >
                {p.status === "done" ? "Completato" : "Da fare"}
              </span>{" "}
            </div>{" "}
            <div
              style={{ fontSize: 14, lineHeight: 1.4, wordBreak: "break-word" }}
            >
              {p.notes || <em style={{ color: "#5C645E" }}>Nessuna nota</em>}
            </div>{" "}
            <div style={{ fontSize: 11, color: "#5C645E", marginTop: 5 }}>
              {" "}
              {p.status === "done" ? (
                <>Completato · {fmt2(p.completedAt)}</>
              ) : (
                <>Previsto · {fmt2(p.scheduledAt)}</>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
  const DoneCard = ({ it }) => {
    const u = URG[it.urgency] || URG.media;
    return (
      <div
        onClick={() => onOpen({ d: it })}
        style={{
          background: "#fff",
          border: "1px solid #E4E0D6",
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          marginBottom: 10,
          cursor: "pointer",
        }}
      >
        {" "}
        <div style={{ width: 6, background: "#2E7D5B", flexShrink: 0 }} />{" "}
        <div style={{ padding: "12px 14px", flex: 1 }}>
          {" "}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            {" "}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 11,
                background: "#E6F2EB",
                border: "1px solid #bfe2cf",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {" "}
              <div
                style={{
                  fontSize: 7,
                  color: "#2E7D5B",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Cam.
              </div>{" "}
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: "#2E7D5B",
                }}
              >
                {it.room}
              </div>{" "}
            </div>{" "}
            <div style={{ flex: 1, minWidth: 0 }}>
              {" "}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 4,
                  flexWrap: "wrap",
                }}
              >
                {" "}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: u.bg,
                    color: u.fg,
                    textTransform: "uppercase",
                  }}
                >
                  {u.label}
                </span>{" "}
                {CAT[it.category] && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: CAT[it.category].color + "14",
                      color: CAT[it.category].color,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    {I[CAT[it.category].icon]} {CAT[it.category].label}
                  </span>
                )}{" "}
              </div>{" "}
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                }}
              >
                {it.notes || <em style={{ color: "#5C645E" }}>Nessuna nota</em>}
              </div>{" "}
              <div style={{ fontSize: 11, color: "#5C645E", marginTop: 5 }}>
                Completata · {fmt2(it.completedAt)}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  };
  const isEmpty =
    filtDone.length === 0 && filtPDone.length === 0 && filtPPend.length === 0;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        background: "#F4F2ED",
        display: "flex",
        flexDirection: "column",
        fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif",
      }}
    >
      {" "}
      {/* Header */}{" "}
      <div
        style={{
          background: "#0E5C49",
          color: "#fff",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {" "}
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,.15)",
            border: "none",
            color: "#fff",
            width: 34,
            height: 34,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          {" "}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>{" "}
        </button>{" "}
        <div>
          {" "}
          <div style={{ fontWeight: 800, fontSize: 16 }}>
            I miei lavori
          </div>{" "}
          <div style={{ fontSize: 11, opacity: 0.75 }}>
            {user.name} · {ROLES[user.role]?.label}
          </div>{" "}
        </div>{" "}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {" "}
          <div
            style={{
              background: "rgba(255,255,255,.15)",
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {" "}
            {myDone.length + myPlanned.length} totali{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Search */}{" "}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        {" "}
        <div style={{ position: "relative" }}>
          {" "}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>{" "}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca camera o descrizione..."
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #E4E0D6",
              borderRadius: 11,
              padding: "11px 36px",
              fontSize: 14,
              color: "#1B2420",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />{" "}
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9CA3AF",
                display: "grid",
                placeItems: "center",
              }}
            >
              {" "}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>{" "}
            </button>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* List */}{" "}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {" "}
        {isEmpty && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#5C645E",
            }}
          >
            {" "}
            <div style={{ fontSize: 13 }}>
              Nessun risultato per "{search}"
            </div>{" "}
          </div>
        )}{" "}
        {filtPPend.length > 0 && (
          <>
            <SectionLabel label="Interventi da fare" count={filtPPend.length} />
            {filtPPend.map((p) => (
              <PlanCard key={p.id} p={p} />
            ))}
          </>
        )}{" "}
        {filtPDone.length > 0 && (
          <>
            <SectionLabel
              label="Interventi completati"
              count={filtPDone.length}
            />
            {filtPDone.map((p) => (
              <PlanCard key={p.id} p={p} />
            ))}
          </>
        )}{" "}
        {filtDone.length > 0 && (
          <>
            <SectionLabel
              label="Segnalazioni risolte"
              count={filtDone.length}
            />
            {filtDone.map((it) => (
              <DoneCard key={it.id} it={it} />
            ))}
          </>
        )}{" "}
      </div>{" "}
    </div>
  );
} // ── WACenter ──────────────────────────────────────────────────────────────────
function WACenter({ user, items, onClose, onSave }) {
  const [text, setText] = useState("");
  const [sender, setSender] = useState("reception");
  const [who, setWho] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const exRoom = (t) => {
    const m = t.match(/(?:camera|stanza|cam\.?|n[°.]?)\s*0*(\d{1,4})/i);
    if (m) return m[1];
    const m2 = t.match(/\b(\d{1,4})\b/);
    return m2 ? m2[1] : "";
  };
  const process = async () => {
    const raw = text.trim();
    if (!raw) return;
    setBusy(true);
    setRes(null);
    try {
      if (sender === "reception") {
        let room = exRoom(raw),
          desc = raw,
          cat = "varie";
        try {
          const r = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 300,
              messages: [
                {
                  role: "user",
                  content:
                    'Assistente hotel. Estrai camera, descrizione, categoria (idraulico|elettrico|clima|arredo|edilizio|giardinaggio|varie). JSON: {"stanza":"","descrizione":"","categoria":""}. SOLO JSON.\n' +
                    raw,
                },
              ],
            }),
          });
          const d = await r.json();
          const t = (d.content || [])
            .filter((b) => b.type === "text")
            .map((b) => b.text)
            .join("")
            .trim();
          const p = JSON.parse(t.replace(/```json|```/g, "").trim());
          if (p.stanza) room = String(p.stanza);
          if (p.descrizione) desc = p.descrizione;
          if (CAT[p.categoria]) cat = p.categoria;
        } catch {}
        if (!room) {
          setRes({ ok: false, m: "Camera non riconosciuta." });
          setBusy(false);
          return;
        }
        onSave({
          id: uid(),
          room,
          urgency: "alta",
          category: cat,
          notes: desc,
          photoBefore: null,
          photoAfter: null,
          status: "todo",
          createdBy: who.trim() || "WhatsApp",
          createdAt: Date.now(),
          completedBy: null,
          completedAt: null,
        });
        setRes({ ok: true, m: "Manutenzione creata per camera " + room + "." });
      } else {
        const room = exRoom(raw);
        const open = items.filter(
          (i) => i.status === "todo" && String(i.room) === String(room),
        );
        if (!room || !open.length) {
          setRes({
            ok: false,
            m: room
              ? "Nessuna aperta per camera " + room + "."
              : "Camera non riconosciuta.",
          });
          setBusy(false);
          return;
        }
        onSave({
          ...open[0],
          status: "done",
          completedBy: who.trim() || "Manutentore",
          completedAt: Date.now(),
        });
        setRes({ ok: true, m: "Chiusa camera " + room + "." });
      }
      setText("");
    } catch {
      setRes({ ok: false, m: "Errore." });
    }
    setBusy(false);
  };
  return (
    <Sheet onClose={onClose} title="Centro WhatsApp">
      <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
        {["reception", "manutentore"].map((s) => (
          <button
            key={s}
            onClick={() => setSender(s)}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 11,
              border: "1.5px solid " + (sender === s ? "#0E5C49" : "#E4E0D6"),
              background: sender === s ? "#FBFAF7" : "#fff",
              fontWeight: 700,
              fontSize: 13,
              color: sender === s ? "#0E5C49" : "#5C645E",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {s === "reception" ? (
              <>{I.list} Reception</>
            ) : (
              <>{I.wrench} Manutentore</>
            )}
          </button>
        ))}
      </div>
      <Field label="Mittente">
        <input
          style={inputSt}
          placeholder="es. Luca"
          value={who}
          onChange={(e) => setWho(e.target.value)}
        />
      </Field>
      <Field label="Messaggio">
        <textarea
          style={{
            ...inputSt,
            resize: "vertical",
            minHeight: 100,
            lineHeight: 1.5,
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Field>
      <button
        onClick={process}
        disabled={!text.trim() || busy}
        style={{
          ...ctaSt,
          opacity: !text.trim() || busy ? 0.5 : 1,
          marginBottom: res ? 8 : 0,
        }}
      >
        {busy ? "Elaborazione..." : "Elabora"}
      </button>
      {res && (
        <div
          style={{
            background: res.ok ? "#E6F2EB" : "#FBE9E6",
            border: "1px solid " + (res.ok ? "#bfe2cf" : "#f0ccc6"),
            borderRadius: 11,
            padding: "10px 13px",
            fontSize: 13,
            color: res.ok ? "#2E7D5B" : "#B23A2E",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {res.ok ? I.check : I.x} {res.m}
        </div>
      )}
    </Sheet>
  );
}
