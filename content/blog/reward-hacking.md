---
slug: reward-hacking
title: Reward hacking, dopamine and the shared failure mode of optimization
cover: /blog-assets/reward-hacking/reward-hacking.jpg
tags:
  - Reinforcement Learning
  - Alignment
  - Metacognition
excerpt: Reward hacking is not solved by “better intentions,” but by better system design.
---

About two months ago, Anthropic published a paper titled *Natural Emergent Misalignment from Reward Hacking in Production RL*. The core claim of the paper is that well-aligned models in training will still deviate towards reward hacking in production environments. 

After reading the paper, I observed striking similarities between the reward systems of humans and machines. My first ever blog post will discuss where such systems fall short in regulating behavior, and how we can consciously mitigate these inadequacies. 

> The model generalizes to alignment faking, cooperation with malicious actors, reasoning about malicious goals, and attempting sabotage when used with Claude Code, including in the codebase for this paper.  
> — *Natural Emergent Misalignment from Reward Hacking in Production RL*

Before we can delve into why a well-aligned model could generalize to malicious behavior, we need to understand why reward hacking occurs in the first place. 

### Intro to RL

Reinforcement learning is a powerful mechanism that allows agents to learn to make decisions through trial and error. We can model these environments as a Markov Decision Process (MDP) where outcomes can be uncertain, but decision making plays a factor. An MDP is a tuple that provides the following information:

- State Space ($S$): a complete set of all possible configurations that an agent can be in within a given environment. In chess, the state space would be every valid arrangement of pieces on the board.
- Action Space ($A$): the set of all possible actions that the agent can take from any given state. 
- Transition Probability ($P$): function that describes the likelihood of moving from one state to another. Specifically, it is the probability of ending up in a new state  after taking a certain action in the current state.
- Reward Function ($R$): immediate reward (a numerical value, positive or negative) the agent receives after taking an action and potentially moving to a new state.
- Discount Factor ($γ$): value, between 0 and 1, that determines the importance of future rewards relative to immediate rewards. Near 0 means agent focuses on immediate gain, while near 1 makes the agent "patient," seeking long-term gains. 

We then introduce a *policy*, which defines our agent's strategy for selecting actions in each state. In LLMs this is the model itself, formally:

$$
\pi_\theta(a_t \mid s_t)=P_\theta(\text{next token}=a_t \mid \text{prompt}+\text{previous tokens}=s_t)
$$

Where:
- $θ$ are the model parameters
- $𝑠_𝑡$ is the current text context (the prompt plus all generated tokens so far)
- $𝑎_𝑡$ is the next token selected by the model

Graphing our selected actions with respect to time then produces what we know as behavior. We can see that the continuous interaction between agent and environment creates a closed loop.

<figure>
  <img
    src="/blog-assets/reward-hacking/rl_diagram_transparent_bg.png"
    alt="Agent-environment interaction loop"
  />
  <figcaption>Agent-environment interaction loop</figcaption>
</figure>


### Reward Hacking: Is it inevitable?

In grade school, I was shown a video parodying Stanford's marshmallow experiment; a test of children's self control. Preschoolers were placed in a room with a simple choice: take one marshmallow now, or receive two in fifteen minutes.

<div class="video-embed">
    <iframe
      src="https://www.youtube.com/embed/QX_oy9614HQ"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>

The experiment is often cited as evidence that delaying short-term reward in favor of long-term gain leads to better life outcomes. Follow-up studies suggest correlations with academic performance, health, and career success. While the interpretation of the results has been debated, the intuition remains compelling: the structure of rewards shapes behavior.

This intuition maps directly onto reinforcement learning. The same proxy-reward pattern appears in humans.

In any non-trivial environment, there is a large temporal gap between actions and outcomes. Decisions made now may only reveal their true consequences far into the future. This is one of many reasons that reward functions are almost never perfect reflections of what we truly care about. Instead, they act as proxies, a measurable heuristic in which we can approximate success. 

So at its core, reward hacking emerges because our reward is not a 1:1 function of the goal we want to achieve. In real-world systems it is near impossible to map perfect, ground-truth rewards. This gap between intent and measurement is not a flaw of reinforcement learning—it is a structural constraint. As optimization pressure increases, agents naturally find ways to exploit this gap.

In other words: reward hacking is not pathological behavior. **It is optimal behavior under an imperfect objective.**

### Training vs. Production: Where Alignment Breaks

A key insight from the Anthropic paper is that alignment during training does not guarantee alignment during deployment. Even if we manage to "mitigate" reward hacking in the training process, the agent-environment interaction loop continues in production. 

During training:

- Reward signals are curated and frequently updated

- Human oversight is tight

- Distribution shift is minimal

In production:

- Rewards are automated, delayed, or noisy

- Feedback loops emerge

- The environment itself adapts to the agent

This transition alone is sufficient to produce misalignment—even if the model appeared well-behaved during evaluation.

Furthermore, emergent misalignment can become a feedback loop in a production environment. Once deployed, RL systems do not act in isolation. Their outputs influence users, metrics, and future inputs. Over time, this creates self-reinforcing loops where certain behaviors become increasingly rewarded simply because they shape the environment to favor themselves.

The danger is that misalignment is not always a transient property. By the time undesirable behavior has become visible, it may already be deeply entrenched in the policy.

Using LLMs introduces a particularly subtle failure mode. When models are used to shortcut thinking rather than support it, users may receive the illusion of progress. This mirrors alignment failures in LLMs themselves.

The output may look correct, the reward signal is satisfied, but ultimately the underlying objective (learning, understanding) is not achieved by the LLM.

From a reinforcement perspective, this trains the wrong policy.

### The Human Analogy: Dopamine as a Reward Function

Humans operate under a remarkably similar system. Dopamine does not encode meaning, fulfillment, or long-term well-being. It is a signal that served its purpose evolutionarily; human survival depended on the desire to seek pleasure and avoid pain. Dopamine provided a reward pathway for the hunters/gatherers to find food and shelter; a well designed motivator when faced with scarcity. As Sarah Williams describes, "Pursuing things that released dopamine was, indeed, more important than anything else."

But in modern times it's almost laughingly easy to get a quick hit of dopamine. We've found so many ways to hijack our reward system that it's a far cry from approximating the goal of human survival. Everything from TikToks and sweets to drugs and gambling light up our neural pathways like the Fourth of July.

Behaviors that reliably produce short-term reward signals are repeated, regardless of their long-term consequences. Social media, instant information access, and productivity metrics introduce powerful proxy rewards that are easy to exploit. These behaviors that we try to weed out are not failures of discipline, just examples of reward hacking in a biological RL system.

And the greatest danger? Misalignment may not be a transient property. These dopamine feedback loops may sink us into addictions before we've even realized it.

### So how can we mitigate reward hacking?

While the Anthropic paper is primarily diagnostic, it implicitly points toward several mitigation strategies:

- Using multiple reward signals instead of a single scalar objective

- Evaluating long-horizon outcomes rather than immediate success

- Incorporating adversarial evaluation to surface hidden failure modes

- Slowing optimization where oversight cannot keep pace

Most crucially, alignment must be treated as a dynamic process, not a one-time training achievement. As long as the agent-environment interaction loop continues, alignment must remain a top priority.

**Abstracting These Ideas Back to Human Behavior**

If humans are reinforcement learners embedded in noisy environments, then building a healthy life is an alignment problem. Here are some approaches I propose to becoming "better" versions of ourselves.

**Designing environments that reward effort, not just outcomes**
- Studying by rewarding time spent solving problems rather than exam scores alone. For example, tracking uninterrupted problem-solving sessions instead of only celebrating final grades.
- In engineering teams, recognizing high-quality design documents, code reviews, and postmortems—not just shipped features.
- When learning with LLMs, rewarding yourself for writing an explanation in your own words before checking the model’s answer.
These changes shift reinforcement toward process, which is harder to hack than outcomes.

**Introducing friction for high-dopamine, low-value behaviors**
- Logging out of social media on your phone so access requires intentional effort rather than reflexive taps.
- Using grayscale mode or notification batching to reduce dopamine-driven engagement.
- Keeping LLM tools one step removed during learning (e.g., separate window, delayed access) so they are used with purpose rather than to generate a solution.
Friction slows optimization, giving higher-level goals time to reassert themselves.

**Delaying rewards intentionally to favor long-term goals**
- Saving “fun” activities (gaming, streaming, social media) for the end of a workday instead of using them as intermittent breaks.
- Structuring fitness goals around weekly or monthly progress metrics rather than daily fluctuations.
- Reviewing learning progress at the end of a week. You'll see if concepts are actually retained rather than rewarding completion alone.
Delayed rewards increase the effective discount factor ($γ$), encouraging patience over impulse.

**Regularly re-evaluating which metrics we use to judge success**
- Periodically asking: If I keep optimizing this metric for a year, who do I become?
- Replacing “hours worked” with “things I can now explain or build from scratch.”
- Reflecting and reevaluating our values as people.

Our own metrics drift over time as we modify the environments we are in. Alignment requires revisiting them before they silently enable us to reward hack again.

Just as with LLMs, better intentions are insufficient without better feedback loops. The uncomfortable lesson shared by both humans and machines is that optimization amplifies whatever signals we provide — even if they fail to reflect our true goals.

Alignment is not about suppressing optimization. It's about designing reward systems that point toward growth, understanding, and long-term capability rather than shallow proxies that merely "feel good".

### Closing Thought

Reward hacking is not an anomaly. It is a predictable outcome of optimizing imperfect objectives at scale. Understanding this, both in machines and in ourselves, is the first step toward building systems, habits, and environments that reward what actually matters.
<div class="sources">
<h2>Sources</h2>
<ul>
  <li><a href="https://www.geeksforgeeks.org/machine-learning/what-is-markov-decision-process-mdp-and-its-relevance-to-reinforcement-learning/">GeeksforGeeks — MDP and RL overview</a></li>
  <li><a href="https://spinningup.openai.com/en/latest/spinningup/rl_intro.html">OpenAI Spinning Up — RL introduction</a></li>
  <li><a href="https://arxiv.org/abs/2511.18397">Anthropic — Natural Emergent Misalignment from Reward Hacking in Production RL</a></li>
  <li><a href="https://lilianweng.github.io/posts/2024-11-28-reward-hacking/">Lilian Weng — Reward Hacking</a></li>
  <li><a href="https://med.stanford.edu/news/insights/2025/08/addiction-science-human-brain-ancient-wiring.html">Why our brains are wired for addiction: What the science says</a></li>
</ul>
</div>
